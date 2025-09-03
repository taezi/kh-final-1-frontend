// src/components/MypageInquiry.jsx
import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";
import { getInquiries } from "../service/manageAPI";
import { useNavigate } from "react-router-dom";
import "../css/MypageInquiry.css";

export default function MypageInquiry() {
  const user = useAuthStore((state) => state.user);
  const [inquiries, setInquiries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.userno) {
      getInquiries(user.userno)
        .then((data) => setInquiries(data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  const goToDetail = (inquiryno) => {
    navigate(`/inquiry/detail/${inquiryno}`);
  };

  return (
    <div className="inquiry-list-container">
      <h3>나의 문의 내역</h3>
      <table className="inquiry-table">
        <thead>
          <tr>
            <th>처리상태</th>
            <th>제목</th>
            <th>날짜</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.length > 0 ? (
            inquiries.map((inq) => (
              <tr
                key={inq.inquiryno}
                onClick={() => goToDetail(inq.inquiryno)} // ✅ 수정됨
                style={{ cursor: "pointer" }} // UX 개선 (클릭 가능 표시)
              >
                <td>{inq.status === "pending" ? "처리중" : "답변완료"}</td>
                <td>{inq.inquiryTitle}</td>
                <td>{new Date(inq.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr key="no-inquiries-row">
              <td colSpan="3" style={{ textAlign: "center" }}>
                최근 문의하신 내역이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
