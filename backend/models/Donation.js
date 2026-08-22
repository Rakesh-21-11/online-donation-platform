const mongoose = require("mongoose");

const donationSchema =
  new mongoose.Schema(
    {
      campaignId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
      },

      campaignTitle: {
        type: String,
        required: true,
      },

      donorId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      donorName: {
        type: String,
        required: true,
      },

      amount: {
        type: Number,
        required: true,
      },

      currency: {
        type: String,
        default: "INR",
      },

      paymentStatus: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "PENDING",
      },

      razorpayOrderId: {
        type: String,
        default: "",
        index: true,
      },

      razorpayPaymentId: {
        type: String,
        default: "",
        index: true,
      },

      razorpaySignature: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Donation",
    donationSchema
  );