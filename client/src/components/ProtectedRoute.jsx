import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/" replace />; // Hoặc trang báo lỗi không có quyền
  }

  return children;
};

export default ProtectedRoute;
