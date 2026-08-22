import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-purple-700 to-blue-600 text-white py-24">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h1 className="text-6xl font-bold">
            DonationHub ❤️
          </h1>

          <p className="mt-6 text-xl max-w-2xl mx-auto">
            Connect donors with meaningful causes.
            Support campaigns, change lives, and
            make a real impact today.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">

            <Link
              to="/campaigns"
              className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Donate Now
            </Link>

            <Link
              to="/create-campaign"
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-700"
            >
              Start Campaign
            </Link>

          </div>

        </div>

      </section>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-6 py-16">

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-3xl font-bold text-purple-700">
              100+
            </h2>
            <p>Total Donors</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-3xl font-bold text-green-600">
              50+
            </h2>
            <p>Campaigns</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-3xl font-bold text-blue-600">
              ₹1L+
            </h2>
            <p>Raised</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-3xl font-bold text-red-600">
              500+
            </h2>
            <p>Lives Impacted</p>
          </div>

        </div>

      </section>

      {/* CATEGORIES */}
      <section className="bg-white py-16">

        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-10">
            Explore Categories
          </h2>

          <div className="grid md:grid-cols-5 gap-6">

            <div className="bg-purple-100 p-6 rounded-xl text-center">
              🎓
              <h3 className="font-bold mt-2">
                Education
              </h3>
            </div>

            <div className="bg-green-100 p-6 rounded-xl text-center">
              🍲
              <h3 className="font-bold mt-2">
                Food
              </h3>
            </div>

            <div className="bg-red-100 p-6 rounded-xl text-center">
              🏥
              <h3 className="font-bold mt-2">
                Medical
              </h3>
            </div>

            <div className="bg-yellow-100 p-6 rounded-xl text-center">
              🐶
              <h3 className="font-bold mt-2">
                Animals
              </h3>
            </div>

            <div className="bg-blue-100 p-6 rounded-xl text-center">
              🚨
              <h3 className="font-bold mt-2">
                Disaster Relief
              </h3>
            </div>

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="py-16">

        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white p-8 rounded-xl shadow text-center">

              <h3 className="text-2xl font-bold">
                1️⃣ Create
              </h3>

              <p className="mt-3 text-gray-600">
                Organizations create fundraising campaigns.
              </p>

            </div>

            <div className="bg-white p-8 rounded-xl shadow text-center">

              <h3 className="text-2xl font-bold">
                2️⃣ Donate
              </h3>

              <p className="mt-3 text-gray-600">
                Donors support causes they care about.
              </p>

            </div>

            <div className="bg-white p-8 rounded-xl shadow text-center">

              <h3 className="text-2xl font-bold">
                3️⃣ Impact
              </h3>

              <p className="mt-3 text-gray-600">
                Funds reach people who need help.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-700 to-blue-600 text-white py-16">

        <div className="text-center">

          <h2 className="text-4xl font-bold">
            Ready to Make a Difference?
          </h2>

          <p className="mt-4 text-lg">
            Join DonationHub today.
          </p>

          <Link
            to="/campaigns"
            className="inline-block mt-6 bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold"
          >
            Explore Campaigns
          </Link>

        </div>

      </section>

    </div>
  );
}