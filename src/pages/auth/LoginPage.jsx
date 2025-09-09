import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import "../../css/LoginPage.css";
import Layout from "../../components/Layout";

export default function LoginPage() {
  const userid = useRef(null);
  const password = useRef(null);
  const navigate = useNavigate();
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
      <div className="login-container">
        <div className="login-box">
          <h2>로그인</h2>
          <input type="text" ref={userid} placeholder="아이디" />
          <input type="password" ref={password} placeholder="비밀번호" />
          <button className="login-button" onClick={handleLogin}>
            로그인
          </button>
         
          <div className="account-actions">
            <Link to="/servicerule">회원가입</Link>
            <span className="divider">|</span>
            <Link to="/findid">아이디 찾기</Link>
            <span className="divider">|</span>
            <Link to="/findpwd">비밀번호 찾기</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
