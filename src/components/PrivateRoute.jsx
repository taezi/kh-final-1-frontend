import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function PrivateRoute({ requiredRole }) {
  const { user } = useAuthStore();

  if (!user) {
    alert("로그인 하셔야 이용하실 수 있습니다.");
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" />;
  }

  return <Outlet></Outlet>;
}
