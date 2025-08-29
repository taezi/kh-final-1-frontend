import Layout from "../components/Layout";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { createInquiry } from "../service/manageAPI"; 
import "../css/InquiryPage.css";

export default function InquiryPage() {
  // useAuthStore를 사용하여 인증된 사용자 정보를 가져옵니다.
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

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
      // 폼 초기화 또는 페이지 이동
      setInquiry({
        name: "",
        phone: "",
        title: "",
        content: "",
      });
      alert("작성이 취소되었습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // postData에 사용자 번호(userno)를 포함하여 요청 본문을 구성합니다.
    const postData = {
      ...inquiry,
      userno: user.userno,
    };

    try {
      // API 호출
      const response = await createInquiry(postData);
      console.log("문의 등록 성공:", response);
      alert("문의가 성공적으로 등록되었습니다.");

      // 문의 등록 후 페이지 이동
      // navigate("/"); 또는 navigate("/inquiry-success");
    } catch (error) {
      console.error("문의 등록 실패:", error);
      alert("문의 등록에 실패했습니다. 다시 시도해 주세요.");
    }
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
            <button type="submit" className="submit-button">
              등록
            </button>
            <button
              type="button"
              className="cancel-button"
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
