import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
  const userid = useRef(null);
  const password = useRef(null);
  const navigate = useNavigate();
  // Zustand 훅에서 loginUser 액션 함수를 가져옵니다.
  const { loginUser } = useAuthStore();

  const handleLogin = async () => {
    try {
      await loginUser({
        userid: userid.current.value,
        password: password.current.value,
      });
      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div>
      <h3>로그인페이지</h3>
      <div>
        <input type="text" ref={userid} placeholder="아이디" />
        <br></br>
        <input type="password" ref={password} placeholder="비밀번호" />
        <br />
        <button onClick={handleLogin}>로그인</button>
      </div>
    </div>
  );
}