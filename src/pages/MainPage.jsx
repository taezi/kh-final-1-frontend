import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { persistor } from "../store/store";

export default function MainPage(params) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    if (user) {
      await persistor.purge();
      dispatch(logout());
      alert("로그아웃 성공");
    } else {
      alert("현재 로그인된 상태가 아닙니다.");
    }
  };

  return (
    <div>
      메인페이지
      {user ? (
        <div>
          <h2>안녕하세요, {user.username}님!</h2>
        </div>
      ) : (
        <div>
          <h2>안녕</h2>
        </div>
      )}
      <div>
        <Link to="/login">로그인</Link>
        <button onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
}
