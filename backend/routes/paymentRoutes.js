const express = require("express");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const authMiddleware = require("../middleware/authMiddleware");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const User = require("../models/User");

const router = express.Router();

async function getOrSyncCampaign(campaignId) {
  let campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    try {
      const renderRes = await fetch("https://online-donation-platform-x9rc.onrender.com/api/campaigns");
      if (renderRes.ok) {
        const renderCampaigns = await renderRes.json();
        const found = renderCampaigns.find((c) => String(c._id) === String(campaignId));
        if (found) {
          campaign = await Campaign.create({
            _id: found._id,
            title: found.title,
            description: found.description || "Campaign description",
            goalAmount: found.goalAmount || 50000,
            raisedAmount: found.raisedAmount || 0,
            image: found.image || "",
            category: found.category || "General",
            createdBy: found.createdBy || "Organization",
          });
        }
      }
    } catch (err) {
      console.error("Error auto-syncing campaign:", err.message);
    }
  }
  return campaign;
}

/* =========================================================
   CREATE RAZORPAY ORDER
   POST /api/payments/create-order
========================================================= */
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { campaignId, amount } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        message: "Campaign ID is required",
      });
    }

    const numericAmount = Number(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: "Invalid donation amount. Amount must be greater than zero.",
      });
    }

    // Unreasonable limit check (e.g. max 1,00,00,000 INR)
    if (numericAmount > 10000000) {
      return res.status(400).json({
        message: "Donation amount exceeds maximum allowed limit.",
      });
    }

    const campaign = await getOrSyncCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({
        message: "Campaign not found",
      });
    }

    // Convert amount from INR to paise
    const amountInPaise = Math.round(numericAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        campaignId: String(campaign._id),
        donorId: String(req.user.id),
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_TSkx4trY3c4NKu",
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
});

/* =========================================================
   VERIFY RAZORPAY PAYMENT
   POST /api/payments/verify
========================================================= */
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      campaignId,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !campaignId) {
      return res.status(400).json({
        message: "Missing required payment verification parameters",
      });
    }

    // 1. IDEMPOTENCY CHECK - Prevent duplicate processing of payment
    const existingDonation = await Donation.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingDonation) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified and recorded",
        donation: existingDonation,
      });
    }

    // 2. SERVER-SIDE SIGNATURE VERIFICATION
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "P6ENOPFaej6oW6zeqEwFhdhE";
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature verification failed",
      });
    }

    // 3. CAMPAIGN AND USER VALIDATION
    const campaign = await getOrSyncCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({
        message: "Associated campaign not found",
      });
    }

    const donor = await User.findById(req.user.id);
    const donorName = req.body.donorName || (donor ? donor.name : req.user.name) || "Anonymous Donor";
    const numericAmount = Number(amount) || 0;

    // 4. CREATE DONATION RECORD ONLY AFTER SUCCESSFUL VERIFICATION
    const donation = await Donation.create({
      campaignId: campaign._id,
      campaignTitle: campaign.title,
      donorId: req.user.id,
      donorName: donorName,
      amount: numericAmount,
      currency: "INR",
      paymentStatus: "SUCCESS",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // 5. ATOMIC DATABASE UPDATES (Prevent race conditions)
    if (numericAmount > 0) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { raisedAmount: numericAmount },
      });

      await User.findByIdAndUpdate(req.user.id, {
        $inc: { totalDonated: numericAmount },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      donation,
    });
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    return res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
});

/* =========================================================
   RAZORPAY WEBHOOK ENDPOINT
   POST /api/payments/webhook
========================================================= */
router.post("/webhook", async (req, res) => {
  try {
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ message: "Missing webhook signature" });
    }

    const bodyString = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyString)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body;
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayPaymentId = paymentEntity.id;
      const razorpayOrderId = paymentEntity.order_id;
      const amountInINR = paymentEntity.amount / 100;
      const campaignId = paymentEntity.notes?.campaignId;
      const donorId = paymentEntity.notes?.donorId;

      // Idempotent processing
      const existingDonation = await Donation.findOne({ razorpayPaymentId });
      if (!existingDonation && campaignId && donorId) {
        const campaign = await Campaign.findById(campaignId);
        const donor = await User.findById(donorId);

        if (campaign) {
          const donation = await Donation.create({
            campaignId: campaign._id,
            campaignTitle: campaign.title,
            donorId: donor ? donor._id : donorId,
            donorName: donor ? donor.name : "Anonymous Donor",
            amount: amountInINR,
            currency: "INR",
            paymentStatus: "SUCCESS",
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature: "WEBHOOK",
          });

          await Campaign.findByIdAndUpdate(campaignId, {
            $inc: { raisedAmount: amountInINR },
          });

          if (donor) {
            await User.findByIdAndUpdate(donor._id, {
              $inc: { totalDonated: amountInINR },
            });
          }
        }
      }
    }

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ message: "Webhook handler error" });
  }
});

module.exports = router;
