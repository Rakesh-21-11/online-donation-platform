import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-3xl font-bold tracking-tight hover:opacity-90 transition">
          DonationHub ❤️
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-5 font-medium">
          {/* GUEST MENU */}
          {!user && (
            <>
              <Link to="/campaigns" className="hover:text-yellow-300 transition">
                Campaigns
              </Link>

              <Link to="/donor-login" className="hover:text-yellow-300 transition">
                Donor Login
              </Link>

              <Link to="/organization-login" className="hover:text-yellow-300 transition">
                Org Login
              </Link>

              <Link
                to="/role-selection"
                className="bg-white text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition shadow"
              >
                Get Started
              </Link>
            </>
          )}

          {/* DONOR MENU */}
          {user?.role === "donor" && (
            <>
              <Link to="/donor-dashboard" className="hover:text-yellow-300 transition">
                Home
              </Link>

              <Link to="/ai-recommendations" className="bg-yellow-400 text-purple-950 px-3 py-1 rounded-lg font-extrabold hover:bg-yellow-300 transition shadow-sm flex items-center gap-1 text-sm">
                ✨ AI Recommendations
              </Link>

              <Link to="/campaigns" className="hover:text-yellow-300 transition">
                Campaigns
              </Link>

              <Link to="/my-donations" className="hover:text-yellow-300 transition">
                My Donations
              </Link>

              <Link to="/profile" className="hover:text-yellow-300 transition">
                Profile
              </Link>
            </>
          )}

          {/* ORGANIZATION MENU */}
          {user?.role === "organization" && (
            <>
              <Link to="/organization-dashboard" className="hover:text-yellow-300 transition">
                Dashboard
              </Link>

              <Link to="/create-campaign" className="hover:text-yellow-300 transition">
                Create Campaign
              </Link>

              <Link to="/my-campaigns" className="hover:text-yellow-300 transition">
                My Campaigns
              </Link>

              <Link to="/profile" className="hover:text-yellow-300 transition">
                Profile
              </Link>
            </>
          )}

          {/* ADMIN MENU */}
          {user?.role === "admin" && (
            <>
              <Link to="/admin-dashboard" className="hover:text-yellow-300 transition">
                Dashboard
              </Link>

              <Link to="/campaigns" className="hover:text-yellow-300 transition">
                Campaigns
              </Link>

              <Link to="/donation-history" className="hover:text-yellow-300 transition">
                Donations
              </Link>

              <Link to="/profile" className="hover:text-yellow-300 transition">
                Profile
              </Link>
            </>
          )}

          {/* LOGGED IN USER BADGE & LOGOUT */}
          {user && (
            <>
              <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full font-semibold border border-white/30 text-sm">
                👤 {user?.name || "User"}
              </div>

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg font-semibold text-sm shadow"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}