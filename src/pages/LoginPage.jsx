import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import "../css/LoginPage.css";
import Layout from "../components/Layout";

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
    <Layout>
      <h3>로그인페이지</h3>
      <div>
        <input type="text" ref={userid} placeholder="아이디" />
        <br />
        <input type="password" ref={password} placeholder="비밀번호" />
        <br />
        <button onClick={handleLogin}>로그인</button>
        <br />
        <button>카카오로 시작하기</button>
        <button>네이버로 시작하기</button>
        <div className="account-actions">
          <Link to="/signup">회원가입</Link>
          <br />
          <Link to="/findid">아이디찾기</Link>
          <br />
          <Link to="/findpwd">비밀번호찾기</Link>
        </div>
      </div>
    </Layout>
  );
}
