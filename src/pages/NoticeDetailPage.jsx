import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import "../css/NoticeDetailPage.css";
import useAuthStore from "../store/authStore";
import { getNoticeDetail, deleteNotice } from "../service/noticeAPI";

export default function NoticeDetailPage() {
  const { noticeno } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const data = await getNoticeDetail(noticeno);
        setNotice(data);
      } catch (error) {
        console.error("공지사항 상세 조회 실패:", error);
      }
    };
    fetchNotice();
  }, [noticeno]);

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteNotice(noticeno);
        alert("삭제되었습니다.");
        navigate("/notice");
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 실패");
      }
    }
  };

  if (!notice) return <p>로딩 중...</p>;

  return (
    <Layout>
      <div className="notice-detail-page">
        <h2>공지사항 상세 정보</h2>

        {/* 수정/삭제 버튼 (작성자만 보이게) */}
        {currentUser && currentUser.userno === notice.userno && (
          <div className="notice-action-buttons">
            <button
              onClick={() => navigate(`/notice/edit/${notice.noticeno}`)}
              className="btnEdit"
            >
              수정
            </button>
            <button onClick={handleDelete} className="btnDelete">
              삭제
            </button>
          </div>
        )}

        <div className="notice-detail-item">
          <p><strong>번호:</strong> {notice.noticeno}</p>
          <p><strong>제목:</strong> {notice.noticetitle}</p>
          <p><strong>내용:</strong> {notice.noticepost}</p>
          <p><strong>작성일:</strong> {notice.noticedate}</p>
          <p><strong>조회수:</strong> {notice.noticeview}</p>
        </div>

        <button onClick={() => navigate(-1)} className="btnBack">
          목록으로
        </button>
      </div>
    </Layout>
  );
}