import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DonationChart() {

  const data = [
    { month: "Jan", amount: 1000 },
    { month: "Feb", amount: 2500 },
    { month: "Mar", amount: 1800 },
    { month: "Apr", amount: 3200 },
  ];

  return (
    <div className="bg-white p-5 rounded-xl shadow mt-6">

      <h2 className="text-xl font-bold mb-4">
        Donations Overview
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" />
        </BarChart>
      </ResponsiveContainer>

    </div>
  );
}