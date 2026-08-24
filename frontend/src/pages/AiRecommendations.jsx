import { useState, useEffect } from "react";
import { fetchApi } from "../utils/api";
import { loadRazorpayScript } from "../utils/loadRazorpay";

const AVAILABLE_INTERESTS = [
  { id: "Education", label: "Education 🎓", icon: "📚" },
  { id: "Healthcare", label: "Healthcare 🏥", icon: "🩺" },
  { id: "Children", label: "Children 👶", icon: "🧸" },
  { id: "Rural Development", label: "Rural Development 🌾", icon: "🏡" },
  { id: "Environment", label: "Environment 🌳", icon: "🌱" },
  { id: "Food", label: "Food 🍲", icon: "🍎" },
  { id: "Animal Welfare", label: "Animal Welfare 🐾", icon: "🐶" },
  { id: "Disaster Relief", label: "Disaster Relief 🚨", icon: "🆘" },
  { id: "Women Empowerment", label: "Women Empowerment 👩‍💼", icon: "💪" },
];

export default function AiRecommendations() {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Donation Modal state
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donateAmount, setDonateAmount] = useState("500");
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  const toggleInterest = (interestId) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((item) => item !== interestId)
        : [...prev, interestId]
    );
  };

  const handleFetchRecommendations = async (interestsToUse = selectedInterests, queryToUse = query) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg("Please log in as a donor to access AI recommendations.");
      return;
    }

    if (interestsToUse.length === 0 && !queryToUse.trim()) {
      setErrorMsg("Please select at least one cause category or type your interest in the search box.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setHasSearched(true);

      const res = await fetchApi("/api/ai/recommend-campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interests: interestsToUse,
          query: queryToUse,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRecommendations(data.recommendations || []);
      } else {
        setErrorMsg(data.message || "Failed to fetch recommendations. Please try again.");
      }
    } catch (err) {
      console.error("AI recommendation request error:", err);
      setErrorMsg("Unable to connect to the recommendation service.");
    } finally {
      setLoading(false);
    }
  };

  const openDonateModal = (campaign) => {
    setSelectedCampaign(campaign);
    setDonateAmount("500");
    setDonationModalOpen(true);
  };

  const handleRazorpayDonation = async () => {
    if (!donateAmount || Number(donateAmount) <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      alert("Please login first to make a donation.");
      return;
    }

    try {
      setDonating(true);

      // 1. Create Razorpay order
      const orderRes = await fetchApi("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignId: selectedCampaign._id,
          amount: Number(donateAmount),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setDonating(false);
        alert(orderData.message || "Failed to initialize Razorpay payment order.");
        return;
      }

      // 2. Load SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setDonating(false);
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      const razorpayKey = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TSkx4trY3c4NKu";

      // 3. Open Razorpay Checkout modal
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "DonationHub",
        description: `Donation for ${selectedCampaign?.title || "Campaign"}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // 4. Verify Payment Signature
            const verifyRes = await fetchApi("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                campaignId: selectedCampaign._id,
                amount: Number(donateAmount),
                donorName: user.name,
              }),
            });

            const verifyData = await verifyRes.json();
            setDonating(false);
            setDonationModalOpen(false);

            if (verifyRes.ok && verifyData.success) {
              alert("🎉 Donation Successful! Thank you for your generosity.");
              // Refresh recommendations to show updated raised amount
              handleFetchRecommendations();
            } else {
              alert(verifyData.message || "Payment verification failed.");
            }
          } catch (err) {
            setDonating(false);
            console.error("Verification error:", err);
            alert("Error verifying payment with server.");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function () {
            setDonating(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setDonating(false);
        alert(`Payment Failed: ${response.error?.description || "Transaction cancelled"}`);
      });

      rzp.open();
    } catch (error) {
      setDonating(false);
      console.error("Donation setup error:", error);
      alert("An error occurred during payment setup.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100 mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-40 h-40 bg-purple-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 transform -translate-x-4 translate-y-4 w-40 h-40 bg-blue-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
          
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm mb-4">
            ✨ AI-POWERED DISCOVERY
          </span>

          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-3">
            AI Campaign Recommendations
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and support high-impact donation campaigns tailored specifically to your personal causes and values.
          </p>
        </div>

        {/* INPUT & SELECTION PANEL */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🎯</span> Choose Your Causes of Interest:
          </h2>

          {/* INTEREST CHIPS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-6">
            {AVAILABLE_INTERESTS.map((item) => {
              const isSelected = selectedInterests.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border font-medium text-sm transition-all duration-200 ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {isSelected && (
                    <span className="ml-2 text-xs bg-white text-purple-700 rounded-full px-1.5 py-0.5 font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* FREE TEXT QUERY FIELD */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What causes are you interested in? (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. I want to support education for rural children or help orphanages"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 pl-11 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition"
              />
              <span className="absolute left-4 top-3.5 text-gray-400 text-lg">💡</span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={() => handleFetchRecommendations()}
              disabled={loading}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-base shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-purple-200"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing Causes with AI...
                </>
              ) : (
                <>
                  <span>✨</span> Find Recommended Campaigns
                </>
              )}
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE ALERT */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-8">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <p className="text-red-700 font-medium text-sm">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* RECOMMENDATION RESULTS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span>🤖</span> AI Recommended Campaigns
            </h2>
            {recommendations.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                {recommendations.length} Matches Found
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-6 h-96 border border-gray-100 shadow" />
              ))}
            </div>
          ) : !hasSearched ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-md">
              <span className="text-6xl block mb-4">🎯</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Select your causes above to find matches</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                Choose one or more cause tags (like Education, Healthcare, or Food) or type what you want to support, then click <strong className="text-purple-700">Find Recommended Campaigns</strong>.
              </p>
            </div>
          ) : recommendations.length === 0 && hasSearched ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
              <span className="text-5xl block mb-4">🔍</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No matching campaigns were found</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Try selecting different interest categories or adjusting your free-text query above.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(({ campaign, score, reason }) => {
                const raised = campaign.raisedAmount || 0;
                const goal = campaign.goalAmount || 1;
                const percent = Math.min(100, Math.round((raised / goal) * 100));

                return (
                  <div
                    key={campaign._id}
                    className="bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* CARD IMAGE & MATCH BADGE */}
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img
                          src={
                            campaign.image ||
                            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
                          }
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* MATCH PERCENTAGE BADGE */}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border border-white/20">
                          <span>✨</span> {score}% Match
                        </div>

                        {/* CATEGORY TAG */}
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-purple-900 text-xs font-semibold px-3 py-1 rounded-full shadow">
                          {campaign.category || "General"}
                        </div>
                      </div>

                      {/* CARD BODY */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">
                          {campaign.title}
                        </h3>

                        <p className="text-gray-600 text-xs line-clamp-2 mb-4 leading-relaxed">
                          {campaign.description}
                        </p>

                        {/* AI REASON EXPLANATION BOX */}
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 mb-5">
                          <p className="text-xs font-semibold text-purple-900 flex items-start gap-1.5">
                            <span className="text-purple-600 font-bold shrink-0">Why recommended:</span>
                          </p>
                          <p className="text-xs text-purple-800 mt-1 leading-normal">
                            {reason}
                          </p>
                        </div>

                        {/* FINANCIAL PROGRESS */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-semibold text-gray-700">
                            <span>₹{raised.toLocaleString()} raised</span>
                            <span className="text-gray-400">₹{goal.toLocaleString()} goal</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD FOOTER WITH DONATE NOW BUTTON */}
                    <div className="p-6 pt-0">
                      <button
                        onClick={() => openDonateModal(campaign)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow hover:shadow-green-100 transition-all flex items-center justify-center gap-2"
                      >
                        <span>❤️</span> Donate Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QUICK DONATION MODAL CONNECTED TO RAZORPAY */}
      {donationModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setDonationModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-4xl block mb-2">🎁</span>
              <h3 className="text-2xl font-bold text-gray-900">Donate to Campaign</h3>
              <p className="text-sm text-purple-700 font-medium mt-1">{selectedCampaign.title}</p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Select Amount (INR ₹)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["200", "500", "1000"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDonateAmount(preset)}
                    className={`py-2 rounded-xl font-bold text-sm border transition ${
                      donateAmount === preset
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50"
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Enter custom amount"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleRazorpayDonation}
              disabled={donating}
              className={`w-full py-4 rounded-xl text-white font-bold text-base shadow-lg transition flex items-center justify-center gap-2 ${
                donating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
              }`}
            >
              {donating ? "Initializing Razorpay..." : `Proceed to Pay ₹${donateAmount || 0} with Razorpay 💳`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
