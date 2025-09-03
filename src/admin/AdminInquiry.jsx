import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllInquiries } from "../service/manageAPI";

export default function AdminInquiry(params) {
  const [inquiries, setInquiries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllInquiries()
      .then((data) => {
        setInquiries(data || []);
      })
      .catch((err) => {
        console.error(err);
        setInquiries([]);
      });
  }, []);

  const goToDetail = (inquiryno) => {
    navigate(`/inquiry/detail/${inquiryno}`);
  };

  return (
    <div className="inquiry-list-container">
      <h3>1:1 문의 내역 (관리자 전용)</h3>
      <table className="inquiry-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>유저 번호</th>
            <th>제목</th>
            <th>처리상태</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.length > 0 ? (
            inquiries.map((inq, idx) => (
              <tr
                key={inq.inquiryno}
                onClick={() => goToDetail(inq.inquiryno)}
                style={{ cursor: "pointer" }}
              >
                <td>{idx + 1}</td>
                <td>{inq.userno}</td>
                <td>{inq.inquiryTitle}</td>
                <td>{inq.status === "pending" ? "처리중" : "답변완료"}</td>
                <td>{new Date(inq.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                등록된 1:1 문의가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
