// src/pages/InquiryDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { getInquiryDetail } from "../../../service/manageAPI";
import "../../../css/InquiryDetailPage.css";
import useAuthStore from "../../../store/authStore";

export default function InquiryDetailPage() {
  const { inquiryno } = useParams();
  const [inquiryDetail, setInquiryDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  console.log("문의글번호 : ", inquiryno);

  useEffect(() => {
    if (inquiryno) {
      getInquiryDetail(inquiryno)
        .then((data) => {
          console.log("1:1문의 내용 : ", data);
          setInquiryDetail(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("문의 상세 정보 불러오기 실패:", err);
          setLoading(false);
        });
    }
  }, [inquiryno]);

  const goToReply = () => {
    navigate(`/inquiry/reply/${inquiryDetail.inquiryno}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="detail-container">
          <p>문의 내역을 불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!inquiryDetail) {
    return (
      <Layout>
        <div className="detail-container">
          <p>문의 내역을 찾을 수 없습니다.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="detail-container-1">
        <h3>1:1 문의 상세 내역</h3>
        <div className="inquiry-info-1">
          <p>
            <strong>제목:</strong> {inquiryDetail.inquiryTitle}
          </p>
          <p>
            <strong>작성일:</strong>{" "}
            {new Date(inquiryDetail.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>상태:</strong>{" "}
            <span className={`status-${inquiryDetail.status}`}>
              {inquiryDetail.status === "pending" ? "처리중" : "답변완료"}
            </span>
          </p>
          <p>
            <strong>문의 내용:</strong>
          </p>
          <div className="content-box-1">{inquiryDetail.inquiryContent}</div>
        </div>
        {inquiryDetail.status === "replied" && (
          <div className="reply-info-1">
            <h4>[ 답변 ]</h4>
            <p>
              <strong>답변일:</strong>{" "}
              {new Date(inquiryDetail.repliedAt).toLocaleString()}
            </p>
            <div className="content-box-1">{inquiryDetail.replyContent}</div>
          </div>
        )}
        {user?.role === "admin" ? (
          <div className="button-container-1">
            <button className="register-btn-1" onClick={goToReply}>
              답변
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
    </Layout>
  );
}
