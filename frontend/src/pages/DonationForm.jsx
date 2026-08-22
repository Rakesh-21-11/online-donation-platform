import { useEffect, useState } from "react";
import { API_URL, RENDER_API_URL } from "../utils/api";

export default function DonationForm() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      let res;
      try {
        res = await fetch(`${API_URL}/api/campaigns`);
        if (!res.ok) throw new Error("Local API error");
      } catch (err) {
        res = await fetch(`${RENDER_API_URL}/api/campaigns`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCampaigns(data);
        if (data.length > 0) {
          setSelectedCampaignId(data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const handleDonate = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    if (!selectedCampaignId) {
      alert("Please select a campaign to donate to");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      alert("Please login first to make a donation");
      return;
    }

    try {
      setLoading(true);

      // 1. Create Razorpay order
      let orderRes = await fetch(`${API_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          amount: Number(amount),
        }),
      });

      if (!orderRes.ok) {
        orderRes = await fetch(`${RENDER_API_URL}/api/payments/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            campaignId: selectedCampaignId,
            amount: Number(amount),
          }),
        });
      }

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setLoading(false);
        alert(orderData.message || "Failed to create payment order");
        return;
      }

      const selectedCampaign = campaigns.find((c) => c._id === selectedCampaignId);

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "DonationHub",
        description: `Donation for ${selectedCampaign?.title || "Campaign"}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Razorpay signature
            const verifyRes = await fetch(`${API_URL}/api/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                campaignId: selectedCampaignId,
                amount: Number(amount),
              }),
            });

            const verifyData = await verifyRes.json();
            setLoading(false);

            if (verifyRes.ok && verifyData.success) {
              alert("Donation Successful! ❤️ Thank you for your generosity.");
              setAmount("");
            } else {
              alert(verifyData.message || "Payment verification failed.");
            }
          } catch (err) {
            setLoading(false);
            console.error("Verification error:", err);
            alert("Error verifying payment with server.");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        setLoading(false);
        alert("Razorpay SDK not loaded. Please try again.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setLoading(false);
        alert(`Payment Failed: ${response.error?.description || "Transaction cancelled"}`);
      });

      rzp.open();
    } catch (error) {
      setLoading(false);
      console.error("Donation form error:", error);
      alert("An error occurred during payment setup.");
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Make a Donation 💝</h1>

        <label className="block text-gray-700 font-semibold mb-2">Select Campaign</label>
        <select
          value={selectedCampaignId}
          onChange={(e) => setSelectedCampaignId(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {campaigns.length === 0 ? (
            <option value="">No campaigns available</option>
          ) : (
            campaigns.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))
          )}
        </select>

        <label className="block text-gray-700 font-semibold mb-2">Donation Amount (INR ₹)</label>
        <input
          type="number"
          placeholder="Enter Amount (e.g. 500)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleDonate}
          disabled={loading}
          className={`w-full text-white py-3 rounded-lg font-semibold text-lg ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 transition-colors"
          }`}
        >
          {loading ? "Processing..." : "Proceed to Pay with Razorpay ❤️"}
        </button>
      </div>
    </div>
  );
}