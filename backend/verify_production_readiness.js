const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const API_URL = "http://localhost:5000";

async function runAudit() {
  console.log("=== COMPREHENSIVE PRODUCTION READINESS AUDIT ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Test GET /api/campaigns
    const res1 = await fetch(`${API_URL}/api/campaigns`);
    assert(res1.ok, "GET /api/campaigns status 200 OK");
    const campaigns = await res1.json();
    assert(Array.isArray(campaigns) && campaigns.length > 0, `Campaigns returned: ${campaigns.length}`);

    // 2. Test GET /api/campaigns/:id
    const campaignId = campaigns[0]._id;
    const res2 = await fetch(`${API_URL}/api/campaigns/${campaignId}`);
    assert(res2.ok, `GET /api/campaigns/${campaignId} status 200 OK`);
    const singleCampaign = await res2.json();
    assert(singleCampaign._id === campaignId, "Single campaign fetched correctly");

    // 3. Test POST /api/payments/create-order
    const dummyToken = jwt.sign({ id: "6a8968ef25aaafa3dc9dab64", role: "donor" }, process.env.JWT_SECRET || "secret");
    const res3 = await fetch(`${API_URL}/api/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dummyToken}`,
      },
      body: JSON.stringify({
        campaignId: campaignId,
        amount: 500,
      }),
    });
    assert(res3.ok, "POST /api/payments/create-order status 200 OK");
    const orderData = await res3.json();
    assert(orderData.success && orderData.orderId && orderData.orderId.startsWith("order_"), `Order ID generated: ${orderData.orderId}`);

    // 4. Test GET /api/donations/user/lucky
    const res4 = await fetch(`${API_URL}/api/donations/user/lucky`);
    assert(res4.ok, "GET /api/donations/user/lucky status 200 OK");
    const userDonations = await res4.json();
    assert(Array.isArray(userDonations), `User donations count: ${userDonations.length}`);

    // 5. Test GET /api/dashboard/organization/6a897cc88a513752d55d477e
    const res5 = await fetch(`${API_URL}/api/dashboard/organization/6a897cc88a513752d55d477e`);
    assert(res5.ok, "GET /api/dashboard/organization/:id status 200 OK");
    const orgStats = await res5.json();
    assert(orgStats.totalCampaigns !== undefined && orgStats.totalRaised !== undefined, "Organization stats structure valid");

    console.log(`\nAudit Complete: ${passed} PASSED, ${failed} FAILED.`);
    if (failed === 0) {
      console.log("🎉 ALL PLATFORM & PAYMENT AUDITS PASSED! READY FOR VERCEL & RENDER DEPLOYMENT.");
    }
  } catch (err) {
    console.error("Audit error:", err);
  }
}

runAudit();
