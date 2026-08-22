import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchApi } from "../utils/api";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setCategory(categoryFromUrl);
    }
    fetchApi("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCampaigns(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const getCategoryImage = (
    category
  ) => {
    switch (category) {
      case "Food":
        return "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c";

      case "Education":
        return "https://images.unsplash.com/photo-1509062522246-3755977927d7";

      case "Medical":
        return "https://images.unsplash.com/photo-1584515933487-779824d29309";

      case "Animals":
        return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b";

      case "Disaster Relief":
        return "https://images.unsplash.com/photo-1521295121783-8a321d551ad2";

      case "Women Empowerment":
        return "https://images.unsplash.com/photo-1524504388940-b1c1722653e1";

      default:
        return "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c";
    }
  };

  const filteredCampaigns =
    campaigns
      .filter((campaign) => {
        const matchesSearch =
          campaign.title
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesCategory =
          category === "All" ||
          campaign.category ===
            category;

        return (
          matchesSearch &&
          matchesCategory
        );
      })
      .sort((a, b) => {
        if (sortBy === "goal") {
          return (
            b.goalAmount -
            a.goalAmount
          );
        }

        if (
          sortBy === "raised"
        ) {
          return (
            (b.raisedAmount ||
              0) -
            (a.raisedAmount ||
              0)
          );
        }

        return (
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
        );
      });

  const totalRaised =
    campaigns.reduce(
      (sum, campaign) =>
        sum +
        (campaign.raisedAmount ||
          0),
      0
    );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HERO */}
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
              Support a Cause ❤️
            </h1>

            <p className="mt-4 text-xl">
              Every donation helps
              someone in need.
            </p>

            <p className="mt-3 text-lg">
              {campaigns.length}
              {" "}Active Campaigns
            </p>

          </div>

        </div>
      </div>

      <div className="p-8">

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-gray-500">
              Active Campaigns
            </h3>

            <h2 className="text-3xl font-bold text-purple-600">
              {campaigns.length}
            </h2>

          </div>

          <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-gray-500">
              Total Raised
            </h3>

            <h2 className="text-3xl font-bold text-green-600">
              ₹{totalRaised}
            </h2>

          </div>

          <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-gray-500">
              Categories
            </h3>

            <h2 className="text-3xl font-bold text-blue-600">
              6
            </h2>

          </div>

        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-8 flex flex-col md:flex-row gap-4">

          <input
            type="text"
            placeholder="Search Campaign..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="border p-3 rounded w-full"
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
            className="border p-3 rounded"
          >
            <option>All</option>
            <option>
              Education
            </option>
            <option>
              Food
            </option>
            <option>
              Medical
            </option>
            <option>
              Animals
            </option>
            <option>
              Disaster Relief
            </option>
            <option>
              Women Empowerment
            </option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
            className="border p-3 rounded"
          >
            <option value="newest">
              Newest
            </option>

            <option value="goal">
              Highest Goal
            </option>

            <option value="raised">
              Most Raised
            </option>
          </select>

        </div>

        {/* CAMPAIGNS */}
        {filteredCampaigns.length ===
        0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">

            <h2 className="text-3xl font-bold">
              🔍 No Campaigns Found
            </h2>

            <p className="text-gray-500 mt-2">
              Try another search or
              category.
            </p>

          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredCampaigns.map(
              (campaign) => {

                const progress =
                  campaign.goalAmount >
                  0
                    ? (
                        ((campaign.raisedAmount ||
                          0) /
                          campaign.goalAmount) *
                        100
                      ).toFixed(0)
                    : 0;

                return (
                  <div
                    key={campaign._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
                  >

                    <div className="relative">

                      <img
                        src={
                          campaign.image ||
                          getCategoryImage(
                            campaign.category
                          )
                        }
                        alt={campaign.title}
                        className="w-full h-56 object-cover"
                      />

                      {progress >=
                        50 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                          🔥 Trending
                        </span>
                      )}

                    </div>

                    <div className="p-5">

                      <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                        {campaign.category}
                      </span>

                      <h2 className="text-xl font-bold mt-3">
                        {campaign.title}
                      </h2>

                      <p className="text-gray-600 mt-2 text-sm">
                        {campaign.description}
                      </p>

                      <div className="mt-4">

                        <div className="flex justify-between text-sm">

                          <span>
                            Raised
                          </span>

                          <span>
                            Goal
                          </span>

                        </div>

                        <div className="flex justify-between font-bold">

                          <span className="text-green-600">
                            ₹
                            {campaign.raisedAmount ||
                              0}
                          </span>

                          <span>
                            ₹
                            {campaign.goalAmount}
                          </span>

                        </div>

                      </div>

                      <div className="mt-4">

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

                        <p className="text-sm mt-1 text-right">
                          {progress}%
                          Funded
                        </p>

                      </div>

                      <Link
                        to={`/campaign/${campaign._id}`}
                        className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
                      >
                        View Details
                      </Link>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
}