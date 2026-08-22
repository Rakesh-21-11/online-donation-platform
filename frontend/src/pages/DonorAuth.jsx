import { Link } from "react-router-dom";

export default function DonorAuth() {
  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-96">

        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Donor
        </h1>

        <div className="space-y-4">

          <Link
            to="/donor-login"
            className="block bg-blue-500 hover:bg-blue-600 transition text-white text-center py-3 rounded-lg font-semibold"
          >
            Login
          </Link>

          <Link
            to="/donor-signup"
            className="block bg-green-500 hover:bg-green-600 transition text-white text-center py-3 rounded-lg font-semibold"
          >
            Signup
          </Link>

        </div>

      </div>

    </div>
  );
}