import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatsCard from "../components/StatsCard";
import { fetchApi } from "../utils/api";

export default function OrganizationDashboard() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [stats, setStats] =
    useState({
      totalCampaigns: 0,
      totalRaised: 0,
      totalDonors: 0,
      recentDonations: [],
    });

  useEffect(() => {
    if (!user?._id) return;
    fetchApi(
      `/api/dashboard/organization/${user._id}`
    )
      .then((res) => res.json())
      .then((data) =>
        setStats(data)
      )
      .catch((err) =>
        console.log(err)
      );
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-600 text-white rounded-2xl p-8 shadow-lg mb-8">

        <h1 className="text-4xl font-bold">
          Welcome {user?.name} 👋
        </h1>

        <p className="mt-2 text-lg">
          Manage your campaigns and
          track donations.
        </p>

      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <StatsCard
          title="Campaigns Created"
          value={stats.totalCampaigns}
        />

        <StatsCard
          title="Total Raised"
          value={`₹${stats.totalRaised}`}
        />

        <StatsCard
          title="Total Donors"
          value={stats.totalDonors}
        />

        <StatsCard
          title="Active Campaigns"
          value={stats.totalCampaigns}
        />

      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-2xl font-bold mb-4">
          Quick Actions
        </h2>

        <div className="flex gap-4">

          <Link
            to="/create-campaign"
            className="bg-purple-600 text-white px-5 py-3 rounded-lg"
          >
            Create Campaign
          </Link>

          <Link
            to="/my-campaigns"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            My Campaigns
          </Link>

        </div>

      </div>

      {/* Recent Donations */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="text-2xl font-bold mb-4">
          Recent Donations
        </h2>

        {stats.recentDonations
          .length === 0 ? (
          <p>
            No donations received yet.
          </p>
        ) : (
          <div className="space-y-3">

            {stats.recentDonations.map(
              (
                donation
              ) => (
                <div
                  key={
                    donation._id
                  }
                  className="flex justify-between border-b pb-2"
                >

                  <div>

                    <p className="font-semibold">
                      {
                        donation.donorName
                      }
                    </p>

                    <p className="text-sm text-gray-500">
                      {
                        donation.campaignTitle
                      }
                    </p>

                  </div>

                  <span className="font-bold text-green-600">
                    ₹
                    {
                      donation.amount
                    }
                  </span>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}