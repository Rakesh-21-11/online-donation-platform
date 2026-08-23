import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../utils/api";

export default function DonorSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetchApi("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          role: "donor",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration Successful 🎉 Please log in.");
        navigate("/donor-login");
      } else {
        alert(data.message || "Signup Failed");
      }
    } catch (error) {
      alert("Signup Failed. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Signup Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold text-center mb-2 text-green-600">
          Donor Signup
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Create Your Account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <button className="w-full bg-green-500 hover:bg-green-600 transition text-white py-3 rounded-lg font-semibold">
            Signup
          </button>
        </form>
      </div>
    </div>
  );
}