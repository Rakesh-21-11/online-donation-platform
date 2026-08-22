import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">

      <div className="max-w-7xl mx-auto px-8 py-12 grid md:grid-cols-3 gap-10">

        {/* Logo & About */}
        <div>

          <h2 className="text-3xl font-bold text-purple-400">
            DonationHub
          </h2>

          <p className="mt-4 text-gray-300">
            Connecting donors with meaningful
            causes. Together we can create a
            positive impact and support people
            in need.
          </p>

        </div>

        {/* Quick Links */}
        <div>

          <h3 className="text-xl font-semibold mb-4">
            Quick Links
          </h3>

          <div className="flex flex-col gap-2 text-gray-300">

            <Link
              to="/home"
              className="hover:text-white"
            >
              Home
            </Link>

            <Link
              to="/campaigns"
              className="hover:text-white"
            >
              Campaigns
            </Link>

            <Link
              to="/profile"
              className="hover:text-white"
            >
              Profile
            </Link>

          </div>

        </div>

        {/* Contact */}
        <div>

          <h3 className="text-xl font-semibold mb-4">
            Contact
          </h3>

          <p className="text-gray-300">
            📧 support@donationhub.com
          </p>

          <p className="text-gray-300 mt-2">
            📞 +91 98765 43210
          </p>

          <p className="text-gray-300 mt-2">
            📍 India
          </p>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-4 text-center text-gray-400">

        © 2026 DonationHub. All Rights Reserved.

      </div>

    </footer>
  );
}