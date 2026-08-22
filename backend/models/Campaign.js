const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    goalAmount: {
      type: Number,
      required: true,
    },

    raisedAmount: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "General",
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: String,
      default: "Organization",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Campaign",
  campaignSchema
);