import Layout from "../components/Layout";
import React, { useState } from "react";
import "../css/InquiryPage.css";

export default function InquiryPage() {
  const [inquiry, setInquiry] = useState({
    name: "",
    phone: "",
    title: "",
    content: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInquiry((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (window.confirm("작성을 취소하시겠습니까?")) {
      // 폼 초기화 로직 (원하는 곳으로 이동시키거나 필드를 초기화)
      setInquiry({
        name: "",
        phone: "",
        title: "",
        content: "",
      });
      alert("작성이 취소되었습니다.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 문의 등록 로직 (여기서는 간단히 콘솔에 출력)
    console.log("문의 내용:", inquiry);
    alert("문의가 성공적으로 등록되었습니다.");
  };

  return (
    <Layout>
      <div className="inquiry-container">
        <h2>1:1 문의</h2>
        <form className="inquiry-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              type="text"
              id="name"
              name="name"
              value={inquiry.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">휴대 전화 번호</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={inquiry.phone}
              onChange={handleChange}
              placeholder="010-1234-5678"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              name="title"
              value={inquiry.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              name="content"
              value={inquiry.content}
              onChange={handleChange}
              rows="10"
              required
            ></textarea>
          </div>
          <div className="button-group">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
            >
              취소
            </button>
            <button type="submit" className="submit-button">
              등록
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
