import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({
  children,
  allowedRole,
}) {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (
    user.role !== allowedRole
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}