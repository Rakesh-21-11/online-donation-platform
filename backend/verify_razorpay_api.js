const razorpay = require("./config/razorpay");
require("dotenv").config();

async function testOrderCreation() {
  console.log("Testing Razorpay Order creation with live API...");
  console.log("Using Key ID:", process.env.RAZORPAY_KEY_ID);

  try {
    const order = await razorpay.orders.create({
      amount: 50000, // 500 INR in paise
      currency: "INR",
      receipt: `receipt_test_${Date.now()}`,
      notes: {
        purpose: "Testing Razorpay API connection",
      },
    });

    console.log("✓ SUCCESS: Razorpay Order created via Razorpay Test API!");
    console.log("Order Details:", {
      id: order.id,
      entity: order.entity,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
    });
    process.exit(0);
  } catch (error) {
    console.error("❌ FAILED: Razorpay Order Creation Error:", error);
    process.exit(1);
  }
}

testOrderCreation();
