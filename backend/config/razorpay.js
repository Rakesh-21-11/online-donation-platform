const Razorpay = require("razorpay");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_TSkx4trY3c4NKu",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "P6ENOPFaej6oW6zeqEwFhdhE",
});

module.exports = razorpay;
