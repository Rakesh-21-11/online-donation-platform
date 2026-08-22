import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchApi } from "../utils/api";

export default function MyDonations() {
  const [donations, setDonations] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user?.name && !user?._id) return;

    const identifier = user.name || user._id;

    fetchApi(`/api/donations/user/${encodeURIComponent(identifier)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDonations(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const totalAmount =
    donations.reduce(
      (sum, donation) =>
        sum + donation.amount,
      0
    );

  const averageDonation =
    donations.length > 0
      ? Math.round(
          totalAmount /
            donations.length
        )
      : 0;

  const largestDonation =
    donations.length > 0
      ? Math.max(
          ...donations.map(
            (d) => d.amount
          )
        )
      : 0;

  const badge =
    totalAmount >= 5000
      ? "🥇 Hero Donor"
      : totalAmount >= 2000
      ? "🥈 Contributor"
      : totalAmount > 0
      ? "🥉 Supporter"
      : "🌱 New Donor";

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HERO */}
      <div
        className="h-[300px] bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600')",
        }}
      >

        <div className="absolute inset-0 bg-black/50 flex items-center">

          <div className="px-10 text-white">

            <h1 className="text-5xl font-bold">
              My Donations 💝
            </h1>

            <p className="mt-3 text-xl">
              Every contribution creates impact.
            </p>

          </div>

        </div>

      </div>

      <div className="p-8">

        {/* SUMMARY */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white p-5 rounded-xl shadow">

            <h3 className="text-gray-500">
              Total Donations
            </h3>

            <h2 className="text-3xl font-bold text-green-600">
              {donations.length}
            </h2>

          </div>

          <div className="bg-white p-5 rounded-xl shadow">

            <h3 className="text-gray-500">
              Total Amount
            </h3>

            <h2 className="text-3xl font-bold text-blue-600">
              ₹{totalAmount}
            </h2>

          </div>

          <div className="bg-white p-5 rounded-xl shadow">

            <h3 className="text-gray-500">
              Average Donation
            </h3>

            <h2 className="text-3xl font-bold text-purple-600">
              ₹{averageDonation}
            </h2>

          </div>

          <div className="bg-white p-5 rounded-xl shadow">

            <h3 className="text-gray-500">
              Largest Donation
            </h3>

            <h2 className="text-3xl font-bold text-orange-600">
              ₹{largestDonation}
            </h2>

          </div>

        </div>

        {/* BADGE */}
        <div className="bg-white p-6 rounded-xl shadow mb-8 text-center">

          <h2 className="text-2xl font-bold">
            Your Donor Badge
          </h2>

          <p className="text-4xl mt-4">
            {badge}
          </p>

        </div>

        {/* EMPTY */}
        {donations.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center">

            <h2 className="text-2xl font-bold">
              No Donations Yet
            </h2>

            <p className="text-gray-500 mt-2">
              Start supporting campaigns today.
            </p>

          </div>
        ) : (
          <div>

            <h2 className="text-3xl font-bold mb-6">
              Donation History
            </h2>

            <div className="space-y-5">

              {donations.map(
                (donation) => (
                  <div
                    key={donation._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >

                    <div className="flex">

                      <img
                        src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
                        alt="Campaign"
                        className="w-40 h-32 object-cover"
                      />

                      <div className="flex-1 p-5 flex justify-between items-center">

                        <div>

                          <h2 className="text-xl font-bold">
                            {donation.campaignTitle ||
                              "Campaign Donation"}
                          </h2>

                          <p className="text-gray-500">
                            Donated by:
                            {" "}
                            {donation.donorName}
                          </p>

                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(
                              donation.createdAt
                            ).toLocaleDateString()}
                          </p>

                        </div>

                        <div className="text-right">

                          <h2 className="text-3xl font-bold text-green-600">
                            ₹
                            {donation.amount}
                          </h2>

                          {donation.campaignId && (
                            <Link
                              to={`/campaign/${donation.campaignId}`}
                              className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded transition-colors"
                            >
                              View Campaign →
                            </Link>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}