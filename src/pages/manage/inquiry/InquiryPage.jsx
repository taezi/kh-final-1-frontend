import Layout from "../../../components/Layout";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import "../../../css/InquiryPage.css";
import { createInquiry } from "../../../service/manageAPI";

export default function InquiryPage() {
  // useAuthStore를 사용하여 인증된 사용자 정보를 가져옵니다.
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
      // 폼 초기화 또는 페이지 이동
      setInquiry({
        phoneNumber: "",
        inquiryTitle: "",
        inquiryContent: "",
      });
      alert("작성이 취소되었습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      ...inquiry,
      userno: user.userno,
    };
    console.log(postData);

    try {
      // API 호출
      const response = await createInquiry(postData);

      if (response.code === 1) {
        console.log("문의 등록 성공:", response);
        alert(response.msg);
      } else {
        alert(response.msg);
      }
      navigate("/");
    } catch (error) {
      console.error("문의 등록 실패:", error);
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
              defaultValue={user.username}
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
