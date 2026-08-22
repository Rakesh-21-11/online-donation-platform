import { useEffect, useState } from "react";
import AnalyticsCard from "../components/AnalyticsCard";
import RecentDonations from "../components/RecentDonations";
import DonationChart from "../components/DonationChart";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("https://online-donation-platform-x9rc.onrender.com/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.log(err));
  }, []);

  if (!stats) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-600 text-white rounded-2xl p-8 shadow-lg mb-8">

        <h1 className="text-4xl font-bold">
          Admin Dashboard 👨‍💼
        </h1>

        <p className="mt-2 text-lg">
          Monitor platform activity,
          campaigns and donations.
        </p>

      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <AnalyticsCard
          title="Total Users"
          value={stats.users}
        />

        <AnalyticsCard
          title="Campaigns"
          value={stats.campaigns}
        />

        <AnalyticsCard
          title="Donations"
          value={stats.donations}
        />

        <AnalyticsCard
          title="Total Raised"
          value={`₹${stats.totalRaised}`}
        />

      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow-lg mt-8 p-6">

        <h2 className="text-2xl font-bold mb-4">
          Donation Analytics
        </h2>

        <DonationChart />

      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-xl shadow-lg mt-8 p-6">

        <h2 className="text-2xl font-bold mb-4">
          Recent Donations
        </h2>

        <RecentDonations />

      </div>

    </div>
  );
}