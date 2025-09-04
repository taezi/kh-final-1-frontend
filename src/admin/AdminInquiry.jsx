import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllInquiries } from "../service/manageAPI";
// CSS 파일을 import
import "../css/AdminInquiry.css";

export default function AdminInquiry() {
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState("all");
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

  const getFilteredInquiries = () => {
    if (filter === "all") {
      return inquiries;
    } else {
      return inquiries.filter((inq) => inq.status === filter);
    }
  };

  const filteredList = getFilteredInquiries();

  return (
    <div className="inquiry-list-container">
      <div className="inquiry-header">
        <h3>1:1 문의 내역 (관리자 전용)</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="inquiry-select"
        >
          <option value="all">전체</option>
          <option value="pending">처리중</option>
          <option value="replied">답변완료</option>
        </select>
      </div>

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
          {filteredList.length > 0 ? (
            filteredList.map((inq, idx) => (
              <tr key={inq.inquiryno} onClick={() => goToDetail(inq.inquiryno)}>
                <td>{idx + 1}</td>
                <td>{inq.userno}</td>
                <td>{inq.inquiryTitle}</td>
                <td
                  className={
                    inq.status === "pending"
                      ? "status-pending"
                      : "status-replied"
                  }
                >
                  {inq.status === "pending" ? "처리중" : "답변완료"}
                </td>
                <td>{new Date(inq.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-message">
                등록된 1:1 문의가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
