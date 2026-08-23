import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnalyticsCard from "../components/AnalyticsCard";
import { fetchApi } from "../utils/api";

export default function DonorDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Donor" };

  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalDonated: 0,
    campaignsSupported: 0,
    averageDonation: 0,
  });

  const [impact, setImpact] = useState({
    totalRaised: 0,
    totalCampaigns: 0,
  });

  useEffect(() => {
    // 1. Instant 0ms load from local cache
    const cached = localStorage.getItem("cached_campaigns");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sorted = [...parsed].sort(
            (a, b) => (b.raisedAmount || 0) - (a.raisedAmount || 0)
          );
          setCampaigns(sorted.slice(0, 6));
          setImpact({
            totalRaised: parsed.reduce((sum, c) => sum + (c.raisedAmount || 0), 0),
            totalCampaigns: parsed.length,
          });
          setLoading(false);
        }
      } catch (e) {}
    } else {
      setLoading(true);
    }

    // 2. Fresh background fetch
    fetchApi("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => (b.raisedAmount || 0) - (a.raisedAmount || 0)
          );
          setCampaigns(sorted.slice(0, 6));
          localStorage.setItem("cached_campaigns", JSON.stringify(data));

          const totalRaised = data.reduce(
            (sum, campaign) => sum + (campaign.raisedAmount || 0),
            0
          );

          setImpact({
            totalRaised,
            totalCampaigns: data.length,
          });
        }
      })
      .catch((err) => console.error("Error loading campaigns:", err))
      .finally(() => setLoading(false));

    // 2. Fetch user donation history safely
    const donorIdentifier = user.name || user._id;
    if (donorIdentifier) {
      fetchApi(`/api/donations/user/${encodeURIComponent(donorIdentifier)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setDonations(data);

            const totalDonated = data.reduce(
              (sum, donation) => sum + (donation.amount || 0),
              0
            );

            const campaignsSupported = new Set(
              data.map((d) => d.campaignId)
            ).size;

            const averageDonation =
              data.length > 0
                ? Math.round(totalDonated / data.length)
                : 0;

            setStats({
              totalDonated,
              campaignsSupported,
              averageDonation,
            });
          }
        })
        .catch((err) => console.error("Error loading donations:", err));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HERO BANNER */}
      <div
        className="h-[350px] bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1469571486292-b53601020f16?q=80&w=1600')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex items-center">
          <div className="px-10 text-white">
            <h1 className="text-5xl font-bold">
              Welcome {user?.name || "Donor"} 👋
            </h1>

            <p className="mt-4 text-xl">
              Every donation makes a difference. Together we can change lives.
            </p>

            <Link
              to="/campaigns"
              className="inline-block mt-6 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              Explore Campaigns
            </Link>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <AnalyticsCard
            title="Total Donated"
            value={`₹${stats.totalDonated}`}
            icon="💰"
            color="green"
          />

          <AnalyticsCard
            title="Campaigns Supported"
            value={stats.campaignsSupported}
            icon="❤️"
            color="purple"
          />

          <AnalyticsCard
            title="Average Donation"
            value={`₹${stats.averageDonation}`}
            icon="📈"
            color="blue"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold">❤️ Community Impact</h2>
            <p className="mt-2">Together donors are creating change.</p>
            <h3 className="text-4xl font-bold mt-4">₹{impact.totalRaised}</h3>
            <p>Total Funds Raised</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold">📢 Active Campaigns</h2>
            <h3 className="text-4xl font-bold mt-4">{impact.totalCampaigns}</h3>
            <p>Campaigns running now</p>
          </div>
        </div>

        {/* DONATION HISTORY */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-10">
          <h2 className="text-2xl font-bold mb-4">Recent Donation History</h2>
          {donations.length === 0 ? (
            <p className="text-gray-500">No donations yet. Explore campaigns to make your first donation!</p>
          ) : (
            donations.slice(0, 5).map((donation) => (
              <div
                key={donation._id}
                className="flex justify-between items-center border-b py-3 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {donation.campaignTitle || "Campaign Donation"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(donation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-green-600 font-bold text-lg">
                  +₹{donation.amount}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-5">Browse By Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              to="/campaigns?category=Education"
              className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50 transition"
            >
              🎓 Education
            </Link>

            <Link
              to="/campaigns?category=Food"
              className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50 transition"
            >
              🍲 Food
            </Link>

            <Link
              to="/campaigns?category=Medical"
              className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50 transition"
            >
              🏥 Medical
            </Link>

            <Link
              to="/campaigns?category=Animals"
              className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50 transition"
            >
              🐶 Animals
            </Link>

            <Link
              to="/campaigns?category=Disaster Relief"
              className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50 transition"
            >
              🌊 Disaster Relief
            </Link>

            <Link
              to="/campaigns?category=Women Empowerment"
              className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50 transition"
            >
              👩 Women Empowerment
            </Link>
          </div>
        </div>

        {/* FEATURED CAMPAIGNS */}
        <div>
          <h2 className="text-3xl font-bold mb-6">🔥 Featured Campaigns</h2>

          {loading ? (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500 font-medium">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mb-3"></div>
              <p>Loading Active Campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-10 text-center">
              <h2 className="text-2xl font-bold text-gray-800">No Active Campaigns Found</h2>
              <p className="text-gray-500 mt-2">Check back later for new causes to support.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {campaigns.map((campaign) => {
                const progress =
                  campaign.goalAmount > 0
                    ? (
                        ((campaign.raisedAmount || 0) /
                          campaign.goalAmount) *
                        100
                      ).toFixed(0)
                    : 0;

                return (
                  <div
                    key={campaign._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
                  >
                    <img
                      src={
                        campaign.image ||
                        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
                      }
                      alt={campaign.title}
                      className="w-full h-52 object-cover"
                    />

                    <div className="p-4">
                      <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">
                        {campaign.category || "General"}
                      </span>

                      <h3 className="text-xl font-bold mt-3 text-gray-800">
                        {campaign.title}
                      </h3>

                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                        {campaign.description}
                      </p>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1 font-semibold">
                          <span className="text-green-600">
                            Raised ₹{campaign.raisedAmount || 0}
                          </span>

                          <span className="text-gray-600">
                            Goal ₹{campaign.goalAmount}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                            }}
                          />
                        </div>

                        <p className="text-right text-sm mt-1 font-medium text-gray-600">
                          {progress}% Funded
                        </p>
                      </div>

                      <Link
                        to={`/campaign/${campaign._id}`}
                        className="inline-block w-full text-center mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}