import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-purple-700 to-blue-600 text-white shadow-lg">

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-bold"
        >
          DonationHub
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-5">

          {/* DONOR MENU */}
          {user?.role === "donor" && (
            <>
              <Link
                to="/donor-dashboard"
                className="hover:text-yellow-300"
              >
                Home
              </Link>

              <Link
                to="/campaigns"
                className="hover:text-yellow-300"
              >
                Campaigns
              </Link>

              <Link
                to="/my-donations"
                className="hover:text-yellow-300"
              >
                My Donations
              </Link>

              <Link
                to="/profile"
                className="hover:text-yellow-300"
              >
                Profile
              </Link>
            </>
          )}

          {/* ORGANIZATION MENU */}
          {user?.role ===
            "organization" && (
            <>
              <Link
                to="/organization-dashboard"
                className="hover:text-yellow-300"
              >
                Dashboard
              </Link>

              <Link
                to="/create-campaign"
                className="hover:text-yellow-300"
              >
                Create Campaign
              </Link>

              <Link
                to="/my-campaigns"
                className="hover:text-yellow-300"
              >
                My Campaigns
              </Link>

              <Link
                to="/profile"
                className="hover:text-yellow-300"
              >
                Profile
              </Link>
            </>
          )}

          {/* ADMIN MENU */}
          {user?.role === "admin" && (
  <>
    <Link
      to="/admin-dashboard"
      className="hover:text-yellow-300"
    >
      Dashboard
    </Link>

    <Link
      to="/campaigns"
      className="hover:text-yellow-300"
    >
      Campaigns
    </Link>

    <Link
      to="/donation-history"
      className="hover:text-yellow-300"
    >
      Donations
    </Link>

    <Link
      to="/profile"
      className="hover:text-yellow-300"
    >
      Profile
    </Link>
  </>
)}

          {/* USER NAME */}
          <div className="bg-white text-purple-700 px-3 py-1 rounded-full font-semibold">
            👤 {user?.name}
          </div>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>
      </div>

    </nav>
  );
}