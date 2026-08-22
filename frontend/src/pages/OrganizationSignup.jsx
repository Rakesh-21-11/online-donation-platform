import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, RENDER_API_URL } from "../utils/api";

export default function OrganizationSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;
      try {
        res = await axios.post(
          `${API_URL}/api/auth/register`,
          {
            ...form,
            role: "organization",
          }
        );
      } catch (err) {
        res = await axios.post(
          `${RENDER_API_URL}/api/auth/register`,
          {
            ...form,
            role: "organization",
          }
        );
      }

      alert("Registration Successful");

      navigate("/organization-login");

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Signup Failed"
      );

    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Signup Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96">

        <h1 className="text-3xl font-bold text-center mb-2 text-purple-600">
          Organization Signup
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Create Organization Account
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Organization Name"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
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
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <button
            className="w-full bg-purple-600 hover:bg-purple-700 transition text-white py-3 rounded-lg font-semibold"
          >
            Signup
          </button>

        </form>

      </div>

    </div>
  );
}