import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function MainPage() {
  // Zustand 훅을 사용하여 상태와 액션 함수를 가져옵니다.
  // 이 방식은 Redux의 useSelector와 useDispatch를 대체합니다.
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    if (user) {
      logout(); // Zustand 액션 함수 호출
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