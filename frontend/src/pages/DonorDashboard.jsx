import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnalyticsCard from "../components/AnalyticsCard";
import { fetchApi } from "../utils/api";

export default function DonorDashboard() {
  const user = JSON.parse(
  localStorage.getItem("user")
);

const [campaigns, setCampaigns] =
  useState([]);

const [donations, setDonations] =
  useState([]);

const [stats, setStats] =
  useState({
    totalDonated: 0,
    campaignsSupported: 0,
    averageDonation: 0,
  });

const [impact, setImpact] =
  useState({
    totalRaised: 0,
    totalCampaigns: 0,
  });
  useEffect(() => {

  fetchApi(
    "/api/campaigns"
  )
    .then((res) => res.json())
    .then((data) => {

      const sorted =
        data.sort(
          (a, b) =>
            (b.raisedAmount || 0) -
            (a.raisedAmount || 0)
        );

      setCampaigns(
        sorted.slice(0, 6)
      );

      const totalRaised =
        data.reduce(
          (sum, campaign) =>
            sum +
            (campaign.raisedAmount ||
              0),
          0
        );

      setImpact({
        totalRaised,
        totalCampaigns:
          data.length,
      });

    });

  fetchApi(
    `/api/donations/user/${user.name}`
  )
    .then((res) => res.json())
    .then((data) => {

      setDonations(data);

      const totalDonated =
        data.reduce(
          (sum, donation) =>
            sum +
            donation.amount,
          0
        );

      const campaignsSupported =
        new Set(
          data.map(
            (d) =>
              d.campaignId
          )
        ).size;

      const averageDonation =
        data.length > 0
          ? Math.round(
              totalDonated /
                data.length
            )
          : 0;

      setStats({
        totalDonated,
        campaignsSupported,
        averageDonation,
      });

    });

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
              Welcome {user?.name} 👋
            </h1>

            <p className="mt-4 text-xl">
              Every donation makes a difference.
              Together we can change lives.
            </p>

            <Link
              to="/campaigns"
              className="inline-block mt-6 bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold"
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

    <h2 className="text-2xl font-bold">
      ❤️ Community Impact
    </h2>

    <p className="mt-2">
      Together donors are creating change.
    </p>

    <h3 className="text-4xl font-bold mt-4">
      ₹{impact.totalRaised}
    </h3>

    <p>
      Total Funds Raised
    </p>

  </div>

  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">

    <h2 className="text-2xl font-bold">
      📢 Active Campaigns
    </h2>

    <h3 className="text-4xl font-bold mt-4">
      {impact.totalCampaigns}
    </h3>

    <p>
      Campaigns running now
    </p>

  </div>

</div>

        {donations.length === 0 ? (
  <p>
    No donations yet.
  </p>
) : (
  donations
    .slice(0, 3)
    .map((donation) => (

      <div
        key={donation._id}
        className="flex justify-between border-b pb-3"
      >

        <div>

          <p className="font-semibold">
            {donation.campaignTitle}
          </p>

          <p className="text-sm text-gray-500">
            {new Date(
              donation.createdAt
            ).toLocaleDateString()}
          </p>

        </div>

        <span className="text-green-600 font-bold">
          ₹{donation.amount}
        </span>

      </div>

    ))
)}

        <div className="mb-10">

  <h2 className="text-3xl font-bold mb-5">
    Browse By Category
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

    <Link
      to="/campaigns?category=Education"
      className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50"
    >
      📚 Education
    </Link>

    <Link
      to="/campaigns?category=Food"
      className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50"
    >
      🍲 Food
    </Link>

    <Link
      to="/campaigns?category=Medical"
      className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50"
    >
      🏥 Medical
    </Link>

    <Link
      to="/campaigns?category=Animals"
      className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50"
    >
      🐶 Animals
    </Link>

    <Link
      to="/campaigns?category=Disaster Relief"
      className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50"
    >
      🌊 Disaster Relief
    </Link>

    <Link
      to="/campaigns?category=Women Empowerment"
      className="bg-white shadow rounded-xl p-5 text-center hover:bg-purple-50"
    >
      👩 Women Empowerment
    </Link>

  </div>

</div>

        {/* FEATURED CAMPAIGNS */}
        <div>

          <h2 className="text-3xl font-bold mb-6">
            🔥 Featured Campaigns
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {campaigns.map(
              (campaign) => {

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

                      <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                        {campaign.category}
                      </span>

                      <h3 className="text-xl font-bold mt-3">
                        {campaign.title}
                      </h3>

                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                        {campaign.description}
                      </p>

                      <div className="mt-4">

                        <div className="flex justify-between text-sm mb-1">

                          <span>
                            Raised ₹
                            {campaign.raisedAmount || 0}
                          </span>

                          <span>
                            Goal ₹
                            {campaign.goalAmount}
                          </span>

                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">

                          <div
                            className="bg-green-500 h-3 rounded-full"
                            style={{
                              width: `${Math.min(
                                progress,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                        <p className="text-right text-sm mt-1">
                          {progress}% Funded
                        </p>

                      </div>

                      <Link
                        to={`/campaign/${campaign._id}`}
                        className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        View Details
                      </Link>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>

    </div>
  );
}