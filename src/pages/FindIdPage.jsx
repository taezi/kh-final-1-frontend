import { useState } from "react"; 
import Layout from "../components/Layout";
import "../css/FindIdPage.css";
import { findIdByUserInfo } from "../service/authAPI"; // 아이디를 찾는 API 호출을 가정합니다. (함수 이름 변경)
import { useNavigate } from "react-router-dom"; // 로그인 페이지로 돌아가기 위해 useNavigate 훅을 사용합니다.

export default function FindIdPage() {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [foundId, setFoundId] = useState(""); // 찾은 아이디를 저장하는 상태
  const [showResult, setShowResult] = useState(false); // 결과를 보여줄지 말지 결정하는 상태

  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  const handleFindId = async () => {
    // 필수 입력 필드 검증
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!nickname.trim()) {
      alert("별명을 입력해주세요.");
      return;
    }

    try {
      // TODO: 실제로 이름과 별명으로 아이디를 찾는 API 호출 로직을 구현해야 합니다.
      // 예시: const response = await findIdByUserInfo(name, nickname);
      // const resultId = response.data.foundId;

      // 임시로 가상의 아이디를 찾았다고 가정 (API 연동 전 테스트용)
      let resultId = "";
      if (name === "테스트" && nickname === "별명") {
        resultId = "testuser123"; // 임시로 찾은 아이디
      } else {
        resultId = null; // 찾지 못한 경우
      }

      setFoundId(resultId); // 찾은 아이디 업데이트 (없으면 null)
      setShowResult(true); // 결과를 보여주도록 상태 변경
    } catch (error) {
      console.error("아이디 찾기 중 오류 발생:", error);
      alert("아이디를 찾는 중 오류가 발생했습니다. 다시 시도해주세요.");
      setFoundId(null); // 에러 발생 시 아이디를 찾지 못함으로 처리
      setShowResult(true); // 결과를 보여주도록 상태 변경
    }
  };

  // 로그인 페이지로 이동하는 함수
  const goToLoginPage = () => {
    navigate("/login");
  };

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
                required
                autoFocus // 페이지 로드 시 자동으로 포커스
              />
              <input
                className="find-id-input"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="별명을 입력해주세요"
                required
              />
              <button
                className="find-id-button primary-button"
                onClick={handleFindId}
              >
                아이디 찾기
              </button>
            </>
          ) : (
            // 결과를 보여줄 상태이면 결과 메시지를 렌더링
            <div className="find-id-result">
              {foundId ? ( // 아이디를 찾았을 경우
                <>
                  <p>회원님의 아이디는</p>
                  <p className="found-id">"{foundId}"</p>
                  <p>입니다.</p>
                </>
              ) : (
                // 아이디를 찾지 못했을 경우
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
