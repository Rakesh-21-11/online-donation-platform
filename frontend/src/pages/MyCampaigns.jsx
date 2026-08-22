import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApi } from "../utils/api";

export default function MyCampaigns() {
  const [campaigns, setCampaigns] =
    useState([]);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {
    if (!user?._id) return;
    fetchApi(
      `/api/campaigns/organization/${user._id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCampaigns(data);
        }
      })
      .catch((err) =>
        console.log(err)
      );
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Delete this campaign?"
      );

    if (!confirmDelete) return;

    try {
      await fetchApi(
        `/api/campaigns/${id}`,
        {
          method: "DELETE",
        }
      );

      setCampaigns((prev) =>
        prev.filter(
          (campaign) =>
            campaign._id !== id
        )
      );

      alert(
        "Campaign Deleted Successfully"
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-600 text-white rounded-2xl p-8 shadow-lg mb-8">

        <h1 className="text-4xl font-bold">
          My Campaigns
        </h1>

        <p className="mt-2">
          Manage all your fundraising
          campaigns.
        </p>

      </div>

      {/* Empty State */}
      {campaigns.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow text-center">

          <h2 className="text-2xl font-bold">
            No Campaigns Found
          </h2>

          <p className="text-gray-500 mt-2">
            Create your first campaign.
          </p>

          <Link
            to="/create-campaign"
            className="inline-block mt-4 bg-purple-600 text-white px-5 py-3 rounded-lg"
          >
            Create Campaign
          </Link>

        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {campaigns.map(
            (campaign) => {
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
                <div
                  key={campaign._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
                >

                  {/* Image */}
                  <img
                    src={
                      campaign.image ||
                      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
                    }
                    alt={
                      campaign.title
                    }
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-5">

                    {/* Category */}
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                      {
                        campaign.category
                      }
                    </span>

                    {/* Title */}
                    <h2 className="text-xl font-bold mt-3">
                      {
                        campaign.title
                      }
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 mt-2 text-sm">
                      {
                        campaign.description
                      }
                    </p>

                    {/* Goal & Raised */}
                    <div className="mt-4 space-y-1">

                      <p>
                        Goal:
                        ₹
                        {
                          campaign.goalAmount
                        }
                      </p>

                      <p>
                        Raised:
                        ₹
                        {campaign.raisedAmount ||
                          0}
                      </p>

                    </div>

                    {/* Progress */}
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

                      <p className="text-sm text-gray-600 mt-1">
                        {progress}% Funded
                      </p>

                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 mt-5">

                      <Link
                        to={`/campaign/${campaign._id}`}
                        className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
                      >
                        View
                      </Link>

                      <Link
                        to={`/edit-campaign/${campaign._id}`}
                        className="bg-yellow-500 text-white px-3 py-2 rounded text-sm"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(
                            campaign._id
                          )
                        }
                        className="bg-red-600 text-white px-3 py-2 rounded text-sm"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}