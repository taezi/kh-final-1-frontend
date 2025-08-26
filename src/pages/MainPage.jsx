import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import "../css/MainPage.css";
import mainImage from "../img/main.png";

export default function MainPage() {
  // Zustand 훅을 사용하여 상태와 액션 함수를 가져옵니다.
  // 이 방식은 Redux의 useSelector와 useDispatch를 대체합니다.
  const { user, logout } = useAuthStore();

  return (
    <div>
      <div className="main-carousel">
        <img src={mainImage} alt="메인 페이지 배경 이미지" />
      </div>

      <div className="container">
        <div className="left-container"></div>
        <div className="main-container">
          <h2>메인페이지</h2>
        </div>
        <div className="right-container"></div>
      </div>
    </div>
  );
}
