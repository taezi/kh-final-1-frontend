import { useState } from "react";
import "../css/SignupPage.css";
import { useNavigate } from "react-router-dom";
import { signup } from "../service/authAPI";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    userid: "",
    password: "",
    repassword: "",
    nickname: "",
    email: "",
  });

  const [isAgreed, setIsAgreed] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preFormData) => ({
      ...preFormData,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    if (formData.password !== formData.repassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!isAgreed) {
      alert("필수 약관에 동의해야 회원가입이 가능합니다.");
      return;
    }

    try {
      const response = await signup(
        formData.username,
        formData.userid,
        formData.password,
        formData.nickname,
        formData.email
      );
      console.log(response);
      alert("회원가입성공");

      navigate("/login");
    } catch (error) {
      alert("회원가입 오류");
      console.log("회원가입 오류 : ", error);
    }
  };

  return (
    <div>
      <div className="top-blank"></div>

      <div className="container">
        <div className="left-container"></div>
        <div className="main-container">
          <h3>회원가입 페이지</h3>
          {/* 각 input에 name, value, onChange 속성 추가 */}
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="이름을 입력해주세요"
            required
            autoFocus
          />
          <br></br>
          <input
            type="text"
            name="userid"
            value={formData.userid}
            onChange={handleInputChange}
            placeholder="아이디를 입력해주세요"
            required
          />
          <button>중복확인</button>
          <br></br>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력해주세요"
            required
          />
          <br></br>
          <input
            type="password"
            name="repassword"
            value={formData.repassword}
            onChange={handleInputChange}
            placeholder="비밀번호를 다시 입력해주세요"
            required
          />
          <br></br>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일 주소를 입력해주세요"
            required
          />
          <br></br>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder="별명을 입력해주세요"
            required
          />
          <br></br>
          <div>
            <label htmlFor="chk_id">
              가입 필수 정보를 위임하는데 동의합니다.
            </label>
            <input
              type="checkbox"
              className="signup-checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
          </div>
          <button onClick={handleRegister}>회원가입</button>
          <p>
            이미 계정이 있으신가요? <a href="/login">로그인</a>
          </p>
        </div>
        <div className="right-container"></div>
      </div>
    </div>
  );
}
