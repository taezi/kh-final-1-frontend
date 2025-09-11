// src/pages/mypage/inquiry/InquiryPage.jsx
import Layout from "../../../components/Layout";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import "../../../css/InquiryPage.css";
import { createInquiry } from "../../../service/manageAPI";

// ✅ HeroStrip
import HeroStrip from "../../../components/HeroStrip";
import MY_PAGE_HERO from "../../../img/my-page.jpg";

export default function InquiryPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [inquiry, setInquiry] = useState({
    phoneNumber: "",
    inquiryTitle: "",
    inquiryContent: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInquiry((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (window.confirm("작성을 취소하시겠습니까?")) {
      setInquiry({
        phoneNumber: "",
        inquiryTitle: "",
        inquiryContent: "",
      });
      alert("작성이 취소되었습니다.");
      // 필요하면 이전 페이지로 이동
      // navigate(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.userno) {
      alert("로그인 후 이용 가능합니다.");
      navigate("/login");
      return;
    }

    const { phoneNumber, inquiryTitle, inquiryContent } = inquiry;

    // 간단 검증
    if (!phoneNumber.trim() || !inquiryTitle.trim() || !inquiryContent.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // 휴대전화 포맷(국내) 대략 검증
    const phoneOk = /^01[0-9]-?\d{3,4}-?\d{4}$/.test(phoneNumber.trim());
    if (!phoneOk) {
      alert("휴대 전화 번호 형식을 확인해주세요. 예) 010-1234-5678");
      return;
    }

    const postData = {
      ...inquiry,
      userno: user.userno,
    };

    try {
      const response = await createInquiry(postData);

      if (response.code === 1) {
        console.log("문의 등록 성공:", response);
        alert(response.msg || "등록되었습니다.");
      } else {
        alert(response.msg || "등록에 실패했습니다.");
      }
      navigate("/");
    } catch (error) {
      console.error("문의 등록 실패:", error);
      alert("문의 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <Layout>
      {/* ✅ 상단 히어로 (기본: left / 600) */}
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title="문의 내용을 작성해주세요"
        align="left"
        height={600}
        variant="def"
      />

      <div className="inquiry-container">
        <h2>1:1 문의</h2>
        <form className="inquiry-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={user?.username || ""}
              disabled
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">휴대 전화 번호</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={inquiry.phoneNumber}
              onChange={handleChange}
              placeholder="010-1234-5678"
              required
              pattern="01[0-9]-?\d{3,4}-?\d{4}"
              title="예: 010-1234-5678"
            />
          </div>

          <div className="form-group">
            <label htmlFor="inquiryTitle">제목</label>
            <input
              type="text"
              id="inquiryTitle"
              name="inquiryTitle"
              value={inquiry.inquiryTitle}
              onChange={handleChange}
              required
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="inquiryContent">내용</label>
            <textarea
              id="inquiryContent"
              name="inquiryContent"
              value={inquiry.inquiryContent}
              onChange={handleChange}
              rows="10"
              required
              placeholder="문의 내용을 작성해 주세요"
            ></textarea>
          </div>

          <div className="button-group-1">
            <button type="submit" className="submit-button-1">
              등록
            </button>
            <button
              type="button"
              className="cancel-button-1"
              onClick={handleCancel}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
