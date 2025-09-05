import { useState } from "react";
import "../../css/SignupPage.css";
import { useNavigate } from "react-router-dom";
import { duplicateCheck, signup } from "../../service/authAPI";
import Layout from "../../components/Layout";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    userid: "",
    password: "",
    repassword: "",
    nickname: "",
    email: "",
  });

  const [isIdChecked, setIsIdChecked] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preFormData) => ({
      ...preFormData,
      [name]: value,
    }));
  };

  const HandleDuplicatedCheck = async () => {
    if (!formData.userid) {
      alert("아이디를 입력해주세요");
      return;
    }
    console.log("중복체크 아이디 : ", formData.userid);
    try {
      const response = await duplicateCheck(formData.userid);
      if (response.isAvailable) {
        alert(response.msg);
        setIsIdChecked(true);
      } else {
        alert(response.msg);
        setIsIdChecked(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRegister = async () => {
    const koreanRegex = /^[가-힣]+$/;
    if (!koreanRegex.test(formData.username)) {
      alert("이름은 한글만 입력 가능합니다.");
      return;
    }
    if (!isIdChecked) {
      alert("아이디 중복 확인을 먼저 해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("올바른 이메일 양식을 입력해주세요.");
      return;
    }

    if (formData.password !== formData.repassword) {
      alert("비밀번호가 일치하지 않습니다.");
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
      alert("회원가입 성공");

      navigate("/login");
    } catch (error) {
      alert("회원가입 오류");
      console.log("회원가입 오류 : ", error);
    }
  };

  return (
    <Layout>
      <div className="signup-container">
        <div className="signup-box">
          <h3>회원가입</h3>
          <input
            className="signup-input"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="이름을 입력해주세요"
            required
            autoFocus
          />
          <div className="input-group">
            <input
              className="signup-input"
              type="text"
              name="userid"
              value={formData.userid}
              onChange={handleInputChange}
              placeholder="아이디를 입력해주세요"
              required
            />
            <button
              className="duplicate-check-button"
              onClick={HandleDuplicatedCheck}
            >
              중복확인
            </button>
          </div>
          <input
            className="signup-input"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력해주세요"
            required
          />
          <input
            className="signup-input"
            type="password"
            name="repassword"
            value={formData.repassword}
            onChange={handleInputChange}
            placeholder="비밀번호를 다시 입력해주세요"
            required
          />
          <input
            className="signup-input"
            type="text"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="이메일 주소를 입력해주세요"
            required
          />
          <input
            className="signup-input"
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder="별명을 입력해주세요"
            required
          />

          <button className="signup-button" onClick={handleRegister}>
            회원가입
          </button>

          <p className="login-link">
            이미 계정이 있으신가요? <a href="/login">로그인</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
