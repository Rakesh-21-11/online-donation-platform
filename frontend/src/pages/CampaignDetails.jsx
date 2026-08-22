import { useEffect, useState } from "react";
import {
  useParams,
  Link,
} from "react-router-dom";
import { API_URL, RENDER_API_URL, fetchApi } from "../utils/api";
import { loadRazorpayScript } from "../utils/loadRazorpay";

export default function CampaignDetails() {
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [relatedCampaigns, setRelatedCampaigns] = useState([]);
  const [amount, setAmount] = useState("");
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setNotFound(false);
      const campaignRes = await fetchApi("/api/campaigns");
      const campaignData = await campaignRes.json();

      let found = null;
      if (Array.isArray(campaignData)) {
        found = campaignData.find((c) => c._id === id);
      }

      if (!found) {
        const singleRes = await fetchApi(`/api/campaigns/${id}`);
        if (singleRes.ok) {
          const singleData = await singleRes.json();
          if (singleData && singleData._id) {
            found = singleData;
          }
        }
      }

      if (found) {
        setCampaign(found);
        if (Array.isArray(campaignData)) {
          const related = campaignData
            .filter((c) => c._id !== id && c.category === found.category)
            .slice(0, 3);
          setRelatedCampaigns(
            related.length > 0
              ? related
              : campaignData.filter((c) => c._id !== id).slice(0, 3)
          );
        }
      } else {
        setNotFound(true);
      }

      const donationRes = await fetchApi(`/api/donations/${id}`);
      if (donationRes.ok) {
        const donationData = await donationRes.json();
        if (Array.isArray(donationData)) {
          setDonations(donationData);
        }
      }
    } catch (error) {
      console.error("Error loading campaign data:", error);
      setNotFound(true);
    }
  };

  const handleDonate = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      alert("Please login as a donor first");
      return;
    }

    try {
      setLoading(true);

      // 1. Send amount + campaignId to backend to create Razorpay Order
      let orderRes;
      try {
        orderRes = await fetch(`${API_URL}/api/payments/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            campaignId: id,
            amount: Number(amount),
          }),
        });
      } catch (err) {
        orderRes = await fetch(`${RENDER_API_URL}/api/payments/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            campaignId: id,
            amount: Number(amount),
          }),
        });
      }

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setLoading(false);
        alert(orderData.message || "Failed to initialize payment order");
        return;
      }

      // Ensure Razorpay SDK script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setLoading(false);
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      const razorpayKey = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        setLoading(false);
        alert("Razorpay Public Key ID is missing. Please check your environment variables.");
        return;
      }

      // 2. Configure and open Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "DonationHub",
        description: `Donation for ${campaign?.title || "Campaign"}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 3. Send Razorpay payment response to backend for signature verification
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
                campaignId: id,
                amount: Number(amount),
                donorName: user.name,
              }),
            });

            const verifyData = await verifyRes.json();
            setLoading(false);

            if (verifyRes.ok && verifyData.success) {
              alert("Donation Successful! ❤️ Thank you for your support.");
              setAmount("");
              loadData();
            } else {
              alert(verifyData.message || "Payment verification failed. Donation not recorded.");
            }
          } catch (err) {
            setLoading(false);
            console.error("Verification Error:", err);
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
            console.log("Checkout modal dismissed by user");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setLoading(false);
        alert(`Payment Failed: ${response.error?.description || "Transaction cancelled"}`);
      });

      rzp.open();
    } catch (error) {
      setLoading(false);
      console.error("Donate error:", error);
      alert("Something went wrong initializing payment. Please try again.");
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">The campaign you are looking for does not exist or has been removed.</p>
          <Link
            to="/campaigns"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Explore Campaigns
          </Link>
        </div>
      </div>
    );
  }

  if (!campaign)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-10 font-medium text-gray-600">
        Loading Campaign Details...
      </div>
    );

  const progress =
    campaign.goalAmount > 0
      ? (
          ((campaign.raisedAmount ||
            0) /
            campaign.goalAmount) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Hero Image */}
      <div className="relative">

        <img
          src={
            campaign.image ||
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
          }
          alt={
            campaign.title
          }
          className="w-full h-[400px] object-cover"
        />

        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center">

          <div className="text-white px-10">

            <span className="bg-purple-600 px-3 py-1 rounded-full text-sm">
              {
                campaign.category
              }
            </span>

            <h1 className="text-5xl font-bold mt-4">
              {
                campaign.title
              }
            </h1>

          </div>

        </div>

      </div>

      <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-3 gap-8">

        {/* Left Side */}
        <div className="md:col-span-2">

          <div className="bg-white rounded-xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-4">
              About This Campaign
            </h2>

            <p className="text-gray-700 leading-relaxed">
              {
                campaign.description
              }
            </p>

          </div>

          {/* Donation History */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

            <h2 className="text-2xl font-bold mb-4">
              Recent Donations
            </h2>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

  <h2 className="text-2xl font-bold mb-4">
    Related Campaigns
  </h2>

  {relatedCampaigns.length === 0 ? (
    <p>
      No related campaigns available.
    </p>
  ) : (
    <div className="grid md:grid-cols-3 gap-4">

      {relatedCampaigns.map(
        (item) => (

          <div
            key={item._id}
            className="border rounded-lg overflow-hidden shadow"
          >

            <img
              src={
                item.image ||
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
              }
              alt={
                item.title
              }
              className="w-full h-32 object-cover"
            />

            <div className="p-3">

              <h3 className="font-bold">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500">
                {item.category}
              </p>

              <Link
                to={`/campaign/${item._id}`}
                className="inline-block mt-2 bg-blue-600 text-white px-3 py-1 rounded"
              >
                View
              </Link>

            </div>

          </div>
        )
      )}

    </div>
  )}

</div>

            {donations.length ===
            0 ? (
              <p>
                No donations yet.
              </p>
            ) : (
              donations.map(
                (
                  donation
                ) => (
                  <div
                    key={
                      donation._id
                    }
                    className="flex justify-between border-b py-3"
                  >

                    <span>
                      {
                        donation.donorName
                      }
                    </span>

                    <span className="font-bold text-green-600">
                      ₹
                      {
                        donation.amount
                      }
                    </span>

                  </div>
                )
              )
            )}

          </div>

        </div>

        {/* Right Side */}
        <div>

          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-5">

            <h2 className="text-xl font-bold mb-4">
              Campaign Progress
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">

              <div className="bg-green-100 p-4 rounded">

                <p className="text-sm text-gray-600">
                  Raised
                </p>

                <h3 className="text-xl font-bold text-green-700">
                  ₹
                  {campaign.raisedAmount ||
                    0}
                </h3>

              </div>

              <div className="bg-blue-100 p-4 rounded">

                <p className="text-sm text-gray-600">
                  Goal
                </p>

                <h3 className="text-xl font-bold text-blue-700">
                  ₹
                  {
                    campaign.goalAmount
                  }
                </h3>

              </div>

            </div>

            {/* Progress */}
            <div className="w-full bg-gray-200 rounded-full h-4">

              <div
                className="bg-green-500 h-4 rounded-full"
                style={{
                  width: `${Math.min(
                    progress,
                    100
                  )}%`,
                }}
              />

            </div>

            <p className="mt-2 text-center font-semibold">
              {progress}% Funded
            </p>

            {/* Donate */}
            <input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={(
                e
              ) =>
                setAmount(
                  e.target.value
                )
              }
              className="border p-3 rounded w-full mt-6"
            />

            <button
              onClick={handleDonate}
              disabled={loading}
              className={`w-full text-white py-3 rounded-lg mt-4 font-semibold ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 transition-colors"
              }`}
            >
              {loading ? "Processing Payment..." : "Donate Now ❤️"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}