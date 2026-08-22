import { useEffect, useState } from "react";
import { fetchApi } from "../utils/api";

export default function DonationHistory() {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchApi("/api/donations")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDonations(data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Donation History</h1>

      {donations.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-gray-500">No donations recorded yet.</div>
      ) : (
        donations.map((donation) => (
          <div key={donation._id} className="bg-white p-4 rounded shadow mb-3">
            <h3 className="font-bold">{donation.donorName}</h3>
            <p>
              Amount: ₹{donation.amount}
            </p>
            <p className="text-gray-500">
              {new Date(donation.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}