export default function StatsCard({
  title,
  value,
  color = "purple",
}) {

  const colors = {
    purple: "text-purple-600",
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
  };

  return (
    <div className="bg-white shadow rounded-xl p-5">

      <h3 className="text-gray-500">
        {title}
      </h3>

      <h2
        className={`text-2xl font-bold ${
          colors[color] ||
          "text-purple-600"
        }`}
      >
        {value}
      </h2>

    </div>
  );
}