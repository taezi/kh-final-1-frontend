import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect } from "react";

export default function PrivateRoute({ requiredRole }) {
  const { user, justLoggedOut, clearJustLoggedOut } = useAuthStore();

  useEffect(() => {
    if (justLoggedOut && !user) {
      clearJustLoggedOut();
    }
  }, [justLoggedOut, user, clearJustLoggedOut]);

  if (!user) {
    if (justLoggedOut) {
      //  탈퇴/로그아웃 직후: 알림 없이 홈으로
      return <Navigate to="/" replace />;
    }
    alert("로그인 하셔야 이용하실 수 있습니다.");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
