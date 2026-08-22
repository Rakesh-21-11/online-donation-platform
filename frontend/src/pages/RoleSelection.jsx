import { Link } from "react-router-dom";

export default function RoleSelection() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-96">

        <h1 className="text-4xl font-bold text-center text-blue-600 mb-3">
          DonationHub
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Select Account Type
        </p>

        <div className="space-y-4">

          <Link
            to="/donor"
            className="block w-full bg-blue-500 hover:bg-blue-600 transition text-white text-center py-3 rounded-lg font-semibold"
          >
            DONOR
          </Link>

          <Link
            to="/organization"
            className="block w-full bg-purple-500 hover:bg-purple-600 transition text-white text-center py-3 rounded-lg font-semibold"
          >
            ORGANIZATION
          </Link>

        </div>

      </div>
    </div>
  );
}