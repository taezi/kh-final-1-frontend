import React, { useState } from "react";
import Layout from "../../components/Layout";
import "../../css/ServicerulePage.css";
import { useNavigate } from "react-router-dom";

export default function ServicerulePage() {
  const [agreements, setAgreements] = useState({
    age: false,
    privacy: false,
    terms: false,
    marketing: false,
  });

  const allAgreed = Object.values(agreements).every((value) => value);
  const navigate = useNavigate();

  const handleAgreementChange = (event) => {
    const { id, checked } = event.target;
    setAgreements((prevAgreements) => ({
      ...prevAgreements,
      [id]: checked,
    }));
  };

  const handleAllAgreementChange = (event) => {
    const { checked } = event.target;
    setAgreements({
      age: checked,
      privacy: checked,
      terms: checked,
      marketing: checked,
    });
  };

  const handleSubmit = () => {
    if (agreements.privacy && agreements.terms) {
      alert("필수 약관에 모두 동의하셨습니다. 다음 단계로 이동합니다.");
      navigate("/signup");
    } else {
      alert(
        "필수 약관(개인정보 수집 및 이용, 서비스 이용 약관)에 동의해야 합니다."
      );
    }
  };

  return (
    <Layout>
      <div className="terms-container">
        <h3>이용 약관 동의</h3>

        <div className="checkbox-group all-agree">
          <input
            type="checkbox"
            id="all"
            checked={allAgreed}
            onChange={handleAllAgreementChange}
          />
          <label htmlFor="all">전체 약관에 동의합니다.</label>
        </div>

        <hr className="divider" />

        <div className="checkbox-list">
          <div className="checkbox-item required">
            <div className="checkbox-label-group">
              {" "}
              <input
                type="checkbox"
                id="privacy"
                checked={agreements.privacy}
                onChange={handleAgreementChange}
              />
              <label htmlFor="privacy">(필수) 개인정보 수집 및 이용 동의</label>
            </div>
            <div className="terms-content">
              <h4>1. 수집하는 개인정보의 항목</h4>
              <p>
                <strong>필수 항목:</strong> 이름, 아이디, 비밀번호, 닉네임,
                이메일 주소, 휴대전화 번호
                <br />
                <strong>선택 항목:</strong> (선택 항목이 있다면 여기에 기재)
              </p>
              <h4>2. 개인정보 수집 및 이용 목적</h4>
              <p>
                회원 가입 및 서비스 이용에 따른 본인 식별, 회원 관리, 불만 처리
                등 원활한 고객 응대, 맞춤형 서비스 제공
              </p>
              <h4>3. 개인정보 보유 및 이용 기간</h4>
              <p>
                회원 탈퇴 시 또는 개인정보 수집 및 이용 목적 달성 시까지
                보관합니다.
              </p>
            </div>
          </div>

          <div className="checkbox-item required">
            <div className="checkbox-label-group">
              {" "}
              <input
                type="checkbox"
                id="terms"
                checked={agreements.terms}
                onChange={handleAgreementChange}
              />
              <label htmlFor="terms">(필수) 서비스 이용 약관 동의</label>
            </div>
            <div className="terms-content">
              <h4>제1조 (목적)</h4>
              <p>
                이 약관은 [서비스 이름]이 제공하는 모든 서비스의 이용 조건 및
                절차에 관한 기본적인 사항을 규정하는 것을 목적으로 합니다.
              </p>
              <h4>제2조 (회원가입)</h4>
              <p>
                회원은 본 약관에 동의하고, 회사가 정한 양식에 따라 개인정보를
                기재하여 회원가입을 신청합니다. 회사는 회원가입 신청에 대하여
                승낙함을 원칙으로 합니다. 단, 허위 정보를 기재하거나 본 약관에
                위배되는 경우 회원가입을 거절할 수 있습니다.
              </p>
              <h4>제3조 (회원정보의 변경)</h4>
              <p>
                회원은 개인정보가 변경되었을 경우, 즉시 온라인으로 개인정보를
                수정하거나 회사에 통지해야 합니다. 변경된 정보를 회사에 알리지
                않아 발생하는 불이익은 회원이 부담합니다.
              </p>
              <h4>제4조 (회원 탈퇴 및 자격 상실)</h4>
              <p>
                회원은 언제든지 서비스 내 탈퇴 절차를 통해 회원 탈퇴를 요청할 수
                있습니다. 다음의 사유에 해당하는 경우, 회사는 회원 자격을
                제한하거나 상실시킬 수 있습니다. (예: 다른 사람의 명의를 도용한
                경우, 서비스 운영을 고의로 방해하는 경우 등)
              </p>
              <h4>제5조 (면책조항)</h4>
              <p>
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를
                제공할 수 없는 경우 서비스 제공에 대한 책임이 면제됩니다. 회사는
                회원 상호 간 또는 회원과 제3자 간에 서비스를 매개로 발생한
                분쟁에 대해 개입할 의무가 없습니다.
              </p>
            </div>
          </div>

          <div className="checkbox-item">
            <div className="checkbox-label-group">
              {" "}
              <input
                type="checkbox"
                id="age"
                checked={agreements.age}
                onChange={handleAgreementChange}
              />
              <label htmlFor="age">만 14세 이상입니다.</label>
            </div>
          </div>

          <div className="checkbox-item optional">
            <div className="checkbox-label-group">
              {" "}
              <input
                type="checkbox"
                id="marketing"
                checked={agreements.marketing}
                onChange={handleAgreementChange}
              />
              <label htmlFor="marketing">(선택) 알림 이벤트 수신 동의</label>
            </div>
            <div className="terms-content">
              <h4>1. 수집 및 이용 목적</h4>
              <p>
                신규 서비스 및 이벤트 정보, 맞춤형 광고, 프로모션 정보 등을 SMS,
                이메일, 앱 푸시 알림으로 수신하는 데 동의합니다.
              </p>
              <h4>2. 거부 권리 안내</h4>
              <p>
                본 동의는 선택 사항이며, 동의하지 않아도 서비스 이용에 제한이
                없습니다. 동의 철회는 언제든지 회원정보 수정 페이지에서 할 수
                있습니다.
              </p>
            </div>
          </div>
        </div>

        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={!agreements.privacy || !agreements.terms}
        >
          다음
        </button>
      </div>
    </Layout>
  );
}
