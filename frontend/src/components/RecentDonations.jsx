import { useEffect, useState } from "react";
import { fetchApi } from "../utils/api";

export default function RecentDonations() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchApi("/api/donations/recent/all")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDonations(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Recent Donations</h2>

      {donations.length === 0 ? (
        <p className="text-gray-500">No donations yet</p>
      ) : (
        donations.map((donation) => (
          <div key={donation._id} className="flex justify-between items-center border-b py-3">
            <div>
              <p className="font-semibold">{donation.donorName}</p>
              <p className="text-sm text-gray-500">
                {new Date(donation.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="text-green-600 font-bold">₹{donation.amount}</div>
          </div>
        ))
      )}
    </div>
  );
}