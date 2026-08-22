export default function EmptyState({
  message,
}) {
  return (
    <div className="bg-white p-10 rounded-xl shadow text-center">
      <h2 className="text-xl font-semibold">
        {message}
      </h2>
    </div>
  );
}