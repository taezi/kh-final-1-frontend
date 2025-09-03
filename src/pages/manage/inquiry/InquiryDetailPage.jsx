import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { getInquiryDetail } from "../../../service/manageAPI";
import "../../../css/InquiryDetailPage.css";

export default function InquiryDetailPage() {
  const { inquiryno } = useParams();
  const [inquiryDetail, setInquiryDetail] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // 문의 상세 내용 렌더링
  return (
    <Layout>
      <div className="detail-container">
        <h3>1:1 문의 상세 내역</h3>
        <div className="inquiry-info">
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
          <div className="content-box">{inquiryDetail.inquiryContent}</div>
        </div>

        {inquiryDetail.status === "replied" && (
          <div className="reply-info">
            <h4>[ 답변 ]</h4>
            <p>
              <strong>답변일:</strong>{" "}
              {new Date(inquiryDetail.repliedAt).toLocaleString()}
            </p>
            <div className="content-box">{inquiryDetail.replyContent}</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
