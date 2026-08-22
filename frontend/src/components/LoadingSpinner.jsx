export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-purple-600"></div>
    </div>
  );
}