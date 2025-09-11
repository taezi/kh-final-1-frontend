// src/pages/auth/FindPwdPage.jsx
import { useState } from "react";
import Layout from "../../components/Layout";
import "../../css/FindPwdPage.css";
import { findPassword } from "../../service/manageAPI"; // ← manageAPI에서 import
import { useNavigate } from "react-router-dom";

export default function FindPwdPage() {
  const [formData, setFormData] = useState({
    name: "",
    userid: "",
    nickname: "",
  });
  const [foundPwd, setFoundPwd] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFindPwd = async () => {
    const name = formData.name.trim();
    const userid = formData.userid.trim();
    const nickname = formData.nickname.trim();
    if (!name || !userid || !nickname) {
      alert("이름, 아이디, 별명을 모두 입력해주세요.");
      return;
    }

    try {
      const { tempPassword } = await findPassword({ name, userid, nickname });
      setFoundPwd(tempPassword ?? null);
      setShowResult(true);
    } catch (err) {
      console.error("비밀번호 찾기 오류:", err);
      setFoundPwd(null);
      setShowResult(true);
      alert("비밀번호 찾는 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const goToLoginPage = () => navigate("/login");

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
                autoFocus
              />
              <input
                className="find-pwd-input"
                type="text"
                name="userid"
                value={formData.userid}
                onChange={handleInputChange}
                placeholder="아이디를 입력해주세요"
              />
              <input
                className="find-pwd-input"
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="별명을 입력해주세요"
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
                  <p>
                    회원님의 <b>임시 비밀번호</b>는
                  </p>
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
