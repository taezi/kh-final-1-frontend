import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "../../css/NoticeDetailPage.css";
import useAuthStore from "../../store/authStore";
import { getNoticeDetail, deleteNotice } from "../../service/noticeAPI";
import { incrementNoticeView } from "../../service/viewAPI";

export default function NoticeDetailPage() {
  const { noticeno } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        // 조회수 증가 처리
        // localStorage에서 이미 본 게시글인지 확인
        const viewed = JSON.parse(localStorage.getItem("viewedNotices") || "[]");
        if (!viewed.includes(noticeno)) {
          // 한번도 안 본 글이면 조회수 증가
          await incrementNoticeView(noticeno);
          // localStorage에 현재 글 번호 추가
          localStorage.setItem("viewedNotices", JSON.stringify([...viewed, noticeno]));
        }
        // 상세 데이터 가져오기
        const data = await getNoticeDetail(noticeno);
        setNotice(data);
      } catch (error) {
        console.error("상세 조회 실패:", error);
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
        <div className="editor-action-wrapper">
          <button onClick={() => navigate(-1)} className="btnBack">
            목록으로
          </button>
          <div className="editor-action-buttons">
            {currentUser && currentUser.userno === notice.userno && (
              <>
                <button
                  onClick={() => navigate(`/notice/edit/${notice.noticeno}`)}
                  className="btnEdit"
                >
                  수정
                </button>
                <button onClick={handleDelete} className="btnDelete">
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
        <p><strong>조회수:</strong> {notice.noticeview}</p>
        <h4>공지사항 상세 정보</h4>
        <p className="notice-title">
          <strong>{notice.noticetitle}</strong>
        </p>
        <div className="editor-meta">
          <div className="date-info">
            <span>
              <strong>작성일:</strong> {notice.noticedate}
            </span>
            <span className="separator"> / </span>
            <span>
              <strong>수정일:</strong> {notice.noticeupdatedate}
            </span>

          </div>
        </div>
        <div className="notice-detail-info">
          <p>{notice.noticepost}</p>
        </div>
      </div>
    </Layout >
  );
}
