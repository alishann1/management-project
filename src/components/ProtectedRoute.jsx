import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRoles }) {
  const token = sessionStorage.getItem("smartmanager_token");
  const userData = sessionStorage.getItem("smartmanager_user");

  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch {
    sessionStorage.removeItem("smartmanager_token");
    sessionStorage.removeItem("smartmanager_user");
    return <Navigate to="/login" replace />;
  }

  // Normalize the role so uppercase/lowercase differences do not matter.
  const userRole = String(user.role || "").toLowerCase();

  const isAllowed =
    !allowedRoles ||
    allowedRoles.some((role) => role.toLowerCase() === userRole);

  if (!isAllowed) {
    if (userRole === "employee") {
      return <Navigate to="/employee-dashboard" replace />;
    }

    if (userRole === "manager") {
      return <Navigate to="/" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
