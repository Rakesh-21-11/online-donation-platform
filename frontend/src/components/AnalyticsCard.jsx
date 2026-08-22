export default function AnalyticsCard({
  title,
  value,
  icon = "📊",
  color = "purple",
}) {
  const colors = {
    purple: "from-purple-500 to-purple-700",
    green: "from-green-500 to-green-700",
    blue: "from-blue-500 to-blue-700",
    orange: "from-orange-500 to-orange-700",
  };

  return (
    <div
      className={`bg-gradient-to-r ${colors[color]} text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition duration-300`}
    >
      <div className="flex justify-between items-center">

        <div>
          <h3 className="text-sm opacity-90">
            {title}
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div className="text-5xl">
          {icon}
        </div>

      </div>
    </div>
  );
}