import { Link } from "react-router-dom";

export default function OrganizationAuth() {
  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1559027615-cd4628902d4a')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-96">

        <h1 className="text-3xl font-bold text-center mb-6 text-purple-600">
          Organization
        </h1>

        <div className="space-y-4">

          <Link
            to="/organization-login"
            className="block bg-purple-500 hover:bg-purple-600 transition text-white text-center py-3 rounded-lg font-semibold"
          >
            Login
          </Link>

          <Link
            to="/organization-signup"
            className="block bg-orange-500 hover:bg-orange-600 transition text-white text-center py-3 rounded-lg font-semibold"
          >
            Signup
          </Link>

        </div>

      </div>

    </div>
  );
}