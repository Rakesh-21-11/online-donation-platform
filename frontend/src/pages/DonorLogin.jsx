import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../utils/api";

export default function DonorLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetchApi("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/donor-dashboard");
      } else {
        alert(data.message || "Login Failed");
      }
    } catch (error) {
      alert("Login Failed. Please check your credentials.");
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

      {/* Login Card */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96"
      >
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">
          Donor Login
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Welcome Back
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white p-3 rounded-lg font-semibold"
        >
          Login
        </button>

      </form>
    </div>
  );
}