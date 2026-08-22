import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  children,
}) {
  const token =
    localStorage.getItem("token");

  const user =
    localStorage.getItem("user");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    localStorage.clear();

    return <Navigate to="/" replace />;
  }

  return children;
}