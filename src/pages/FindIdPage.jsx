import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import "../css/FindIdPage.css";
import { findId } from "../service/authAPI"; // 아이디를 찾는 API 호출을 가정합니다.

// 타이머를 위한 커스텀 훅
const useTimer = (initialSeconds) => {
  const [timer, setTimer] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const resetTimer = () => {
    setTimer(initialSeconds);
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
  };

  return { timer, resetTimer, stopTimer };
};

const INITIAL_TIMER_SECONDS = 180;

export default function FindIdPage() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [foundId, setFoundId] = useState("");
  const [showResult, setShowResult] = useState(false);

  // 타이머 훅 사용
  const { timer, resetTimer, stopTimer } = useTimer(INITIAL_TIMER_SECONDS);

  const handlePhoneNumberChange = (e) => {
    const numbersOnly = e.target.value.replace(/\D/g, "");
    setPhoneNumber(numbersOnly);
  };

  const displayFormattedPhoneNumber = (numbers) => {
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7
      )}`;
    }
  };

  const handleSendCode = () => {
    if (phoneNumber.length < 10) {
      alert("전화번호를 올바르게 입력해주세요.");
      return;
    }
    // TODO: 실제로 인증번호를 서버로 전송하는 로직을 추가해야 합니다.
    console.log(`인증번호를 ${phoneNumber}로 전송합니다.`);
    setIsCodeSent(true);
    resetTimer(); // 타이머 시작
  };

  const handleVerifyCode = () => {
    // TODO: 서버에서 인증번호를 확인하는 로직을 추가해야 합니다.
    // 여기서는 간단히 '123456'이 올바른 인증번호라고 가정합니다.
    if (verificationCode === "123456") {
      alert("인증 성공!");
      stopTimer(); // 타이머 중지
    } else {
      alert("인증번호가 잘못되었습니다.");
    }
  };

  const handleFindId = async () => {
    if (!name || !phoneNumber) {
      alert("이름과 전화번호를 입력해주세요.");
      return;
    }

    // TODO: 서버 API를 호출하여 아이디를 찾는 로직을 추가해야 합니다.
    // 예시: const result = await findId(name, phoneNumber);

    // 임시로 가상의 아이디를 찾았다고 가정
    const dummyId = "user1234";

    setFoundId(dummyId);
    setShowResult(true);
  };

  // 타이머가 0이 되면 isCodeSent 상태를 리셋
  useEffect(() => {
    if (timer === 0 && isCodeSent) {
      setIsCodeSent(false);
      alert("인증 시간이 초과되었습니다. 다시 시도해주세요.");
    }
  }, [timer, isCodeSent]);

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
              />
              <div className="input-group">
                <input
                  className="find-id-input"
                  type="text"
                  value={displayFormattedPhoneNumber(phoneNumber)}
                  onChange={handlePhoneNumberChange}
                  placeholder="전화번호를 입력해주세요"
                  maxLength="13"
                />
                <button
                  className="find-id-button send-code-button"
                  onClick={handleSendCode}
                  disabled={isCodeSent && timer > 0}
                >
                  {isCodeSent ? "재전송" : "인증번호 전송"}
                </button>
              </div>
              {isCodeSent && (
                <div className="input-group verification-group">
                  <input
                    className="find-id-input"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="인증번호 6자리"
                    maxLength="6"
                  />
                  <span className="timer-text">
                    {Math.floor(timer / 60)}:{("0" + (timer % 60)).slice(-2)}
                  </span>
                  <button
                    className="find-id-button verify-button"
                    onClick={handleVerifyCode}
                  >
                    확인
                  </button>
                </div>
              )}
              <button
                className="find-id-button primary-button"
                onClick={handleFindId}
              >
                아이디 찾기
              </button>
            </>
          ) : (
            <div className="find-id-result">
              <p>회원님의 아이디는</p>
              <p className="found-id">{foundId}</p>
              <p>입니다.</p>
              <button
                className="find-id-button primary-button"
                onClick={() => (window.location.href = "/login")}
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
