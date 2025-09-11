// src/pages/auth/FindIdPage.jsx
import { useState } from "react";
import Layout from "../../components/Layout";
import "../../css/FindIdPage.css";
import { findIdByUserInfo } from "../../service/manageAPI";
import { useNavigate } from "react-router-dom";

export default function FindIdPage() {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [foundId, setFoundId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const handleFindId = async () => {
    if (!name.trim()) return alert("이름을 입력해주세요.");
    if (!nickname.trim()) return alert("별명을 입력해주세요.");

    try {
      // manageAPI.js에서 { data }만 반환하도록 수정했음 → { foundId } 구조 분해 가능
      const { foundId } = await findIdByUserInfo(name.trim(), nickname.trim());

      setFoundId(foundId ?? null); // 못 찾으면 null
      setShowResult(true);
    } catch (err) {
      console.error("아이디 찾기 오류:", err);
      setFoundId(null);
      setShowResult(true);
      alert("아이디를 찾는 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const goToLoginPage = () => navigate("/login");

  return (
    <Layout>
      <div className="find-id-container">
        <div className="find-id-box">
          <h3>아이디 찾기</h3>
          {!showResult ? (
            <>
              <input
                className="find-id-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                autoFocus
              />
              <input
                className="find-id-input"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="별명을 입력해주세요"
              />
              <button
                className="find-id-button primary-button"
                onClick={handleFindId}
              >
                아이디 찾기
              </button>
            </>
          ) : (
            <div className="find-id-result">
              {foundId ? (
                <>
                  <p>회원님의 아이디는</p>
                  <p className="found-id">"{foundId}"</p>
                  <p>입니다.</p>
                </>
              ) : (
                <>
                  <p>입력하신 정보로 아이디를 찾을 수 없습니다.</p>
                  <p>정보를 다시 확인하거나 회원가입을 해주세요.</p>
                </>
              )}
              <button
                className="find-id-button primary-button"
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
