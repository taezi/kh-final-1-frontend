import { useState } from "react";
import Layout from "../../components/Layout";
import "../../css/FindPwdPage.css";
import { findPassword } from "../../service/authAPI"; // 비밀번호를 찾는 API 호출을 가정합니다.
import { useNavigate } from "react-router-dom";

export default function FindPwdPage() {
  const [formData, setFormData] = useState({
    name: "",
    userid: "",
    nickname: "",
  });
  const [foundPwd, setFoundPwd] = useState("");
  const [showResult, setShowResult] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preFormData) => ({
      ...preFormData,
      [name]: value,
    }));
  };

  const handleFindPwd = async () => {
    if (
      !formData.name.trim() ||
      !formData.userid.trim() ||
      !formData.nickname.trim()
    ) {
      alert("이름, 아이디, 별명을 모두 입력해주세요.");
      return;
    }

    try {
      // TODO: 실제로 이름, 아이디, 별명으로 비밀번호를 찾는 API 호출 로직을 구현해야 합니다.
      // 예시: const response = await findPassword(formData);
      // const tempPwd = response.data.tempPassword;

      // 임시로 가상의 비밀번호를 찾았다고 가정 (API 연동 전 테스트용)
      let tempPwd = "";
      if (
        formData.name === "테스트" &&
        formData.userid === "testuser123" &&
        formData.nickname === "별명"
      ) {
        tempPwd = "temp-password-123";
      } else {
        tempPwd = null;
      }

      setFoundPwd(tempPwd);
      setShowResult(true);
    } catch (error) {
      console.error("비밀번호 찾기 중 오류 발생:", error);
      alert("비밀번호를 찾는 중 오류가 발생했습니다. 다시 시도해주세요.");
      setFoundPwd(null);
      setShowResult(true);
    }
  };

  const goToLoginPage = () => {
    navigate("/login");
  };

  return (
    <Layout>
      <div className="find-pwd-container">
        <div className="find-pwd-box">
          <h3>비밀번호 찾기</h3>
          {!showResult ? (
            <>
              <input
                className="find-pwd-input"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="이름을 입력해주세요"
                required
                autoFocus
              />
              <input
                className="find-pwd-input"
                type="text"
                name="userid"
                value={formData.userid}
                onChange={handleInputChange}
                placeholder="아이디를 입력해주세요"
                required
              />
              <input
                className="find-pwd-input"
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="별명을 입력해주세요"
                required
              />
              <button
                className="find-pwd-button primary-button"
                onClick={handleFindPwd}
              >
                비밀번호 찾기
              </button>
            </>
          ) : (
            <div className="find-pwd-result">
              {foundPwd ? (
                <>
                  <p>회원님의 임시 비밀번호는</p>
                  <p className="found-pwd">"{foundPwd}"</p>
                  <p>입니다. 로그인 후 반드시 비밀번호를 변경해주세요.</p>
                </>
              ) : (
                <>
                  <p>입력하신 정보로 비밀번호를 찾을 수 없습니다.</p>
                  <p>정보를 다시 확인하거나 관리자에게 문의해주세요.</p>
                </>
              )}
              <button
                className="find-pwd-button primary-button"
                onClick={goToLoginPage}
              >
                로그인 페이지로 이동
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
