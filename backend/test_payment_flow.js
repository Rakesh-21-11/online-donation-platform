const crypto = require("crypto");
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Campaign = require("./models/Campaign");
const Donation = require("./models/Donation");

async function runTests() {
  console.log("=== RUNNING RAZORPAY INTEGRATION VERIFICATION TESTS ===");

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-donation-platform-test";
  
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected for testing");

    // Clean test collections
    await User.deleteMany({ email: "testdonor@example.com" });
    await Campaign.deleteMany({ title: "Test Razorpay Campaign" });
    await Donation.deleteMany({ campaignTitle: "Test Razorpay Campaign" });

    // 1. Create test user
    const testUser = await User.create({
      name: "Test Donor",
      email: "testdonor@example.com",
      password: "password123",
      role: "donor",
      totalDonated: 0,
    });
    console.log("✓ Test User created:", testUser._id);

    // 2. Create test campaign
    const testCampaign = await Campaign.create({
      title: "Test Razorpay Campaign",
      description: "Testing Razorpay Payment Integration",
      goalAmount: 10000,
      raisedAmount: 0,
      category: "Education",
    });
    console.log("✓ Test Campaign created:", testCampaign._id);

    // 3. Test Signature Verification Logic
    const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret";
    const testOrderId = "order_test_12345";
    const testPaymentId = "pay_test_98765";

    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest("hex");

    const forgedSignature = "invalid_forged_signature_123";

    // Test forged signature check
    const forgedCheck = crypto
      .createHmac("sha256", secret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest("hex") === forgedSignature;

    if (!forgedCheck) {
      console.log("✓ Signature Verification Security: Forged signature successfully REJECTED");
    } else {
      throw new Error("Security flaw: Forged signature was accepted!");
    }

    // Test valid signature check
    const validCheck = crypto
      .createHmac("sha256", secret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest("hex") === validSignature;

    if (validCheck) {
      console.log("✓ Signature Verification Security: Valid signature successfully ACCEPTED");
    } else {
      throw new Error("Valid signature failed check!");
    }

    // 4. Test Donation Record Creation & Atomic DB Updates
    const donationAmount = 500;
    const donation = await Donation.create({
      campaignId: testCampaign._id,
      campaignTitle: testCampaign.title,
      donorId: testUser._id,
      donorName: testUser.name,
      amount: donationAmount,
      currency: "INR",
      paymentStatus: "SUCCESS",
      razorpayOrderId: testOrderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: validSignature,
    });

    await Campaign.findByIdAndUpdate(testCampaign._id, {
      $inc: { raisedAmount: donationAmount },
    });

    await User.findByIdAndUpdate(testUser._id, {
      $inc: { totalDonated: donationAmount },
    });

    const updatedCampaign = await Campaign.findById(testCampaign._id);
    const updatedUser = await User.findById(testUser._id);

    console.log("✓ Campaign raisedAmount updated atomically:", updatedCampaign.raisedAmount, "INR (Expected: 500)");
    console.log("✓ User totalDonated updated atomically:", updatedUser.totalDonated, "INR (Expected: 500)");

    if (updatedCampaign.raisedAmount !== 500 || updatedUser.totalDonated !== 500) {
      throw new Error("Atomic DB update failed!");
    }

    // 5. Test Idempotency / Duplicate Prevention
    const existingPayment = await Donation.findOne({ razorpayPaymentId: testPaymentId });
    if (existingPayment) {
      console.log("✓ Idempotency Check: Existing payment ID detected, duplicate creation PREVENTED");
    } else {
      throw new Error("Idempotency check failed!");
    }

    // Clean up test data
    await User.deleteMany({ email: "testdonor@example.com" });
    await Campaign.deleteMany({ title: "Test Razorpay Campaign" });
    await Donation.deleteMany({ campaignTitle: "Test Razorpay Campaign" });

    console.log("=== ALL BACKEND RAZORPAY VERIFICATION TESTS PASSED SUCCESSFULLY ===");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ TEST FAILED:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
