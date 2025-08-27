import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function PrivateRoute(params) {
  const { user } = useAuthStore();

  if (!!user) {
    return <Outlet></Outlet>;
  }
  alert("로그인 하셔야 이용하실 수 있습니다.");

  return <Navigate to="/login" />;
}
