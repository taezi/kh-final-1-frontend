// src/pages/notice/NoticeDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "../../css/NoticeDetailPage.css";
import useAuthStore from "../../store/authStore";
import { getNoticeDetail, deleteNotice } from "../../service/noticeAPI";
import { incrementNoticeView } from "../../service/viewAPI";

import HeroStrip from "../../components/HeroStrip";
import MY_PAGE_HERO from "../../img/my-page.jpg";

export default function NoticeDetailPage() {
  const { noticeno } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        // 조회수 증가 (중복 방지)
        const viewed = JSON.parse(
          localStorage.getItem("viewedNotices") || "[]"
        );
        if (!viewed.includes(noticeno)) {
          await incrementNoticeView(noticeno);
          localStorage.setItem(
            "viewedNotices",
            JSON.stringify([...viewed, noticeno])
          );
        }

        // 상세 데이터
        const res = await getNoticeDetail(noticeno);
        const data = res?.data || res; // axios/직접객체 모두 대응
        setNotice(data);
      } catch (error) {
        console.error("상세 조회 실패:", error);
      }
    };

    if (noticeno) fetchNotice();
  }, [noticeno]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteNotice(noticeno);
      alert("삭제되었습니다.");
      navigate("/notice");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 실패");
    }
  };

  if (!notice) {
    return (
      <Layout>
        <HeroStrip
          imageSrc={MY_PAGE_HERO}
          title="공지사항"
          subtitle="게시글을 불러오는 중입니다…"
          align="center"
          height={260}
          variant="def"
        />
        <p style={{ padding: "16px" }}>로딩 중...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ✅ 상단 히어로 (필요 시 공지 썸네일 필드가 있다면 우선 사용하도록 변경 가능) */}
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title={notice.noticetitle || "공지사항"}
        subtitle="중요한 안내 사항을 확인하세요"
        align="left"
        height={600}
        variant="def"
      />

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

        <p>
          <strong>조회수:</strong> {notice.noticeview}
        </p>

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
          {/* 서버가 HTML을 내려보낼 수도 있으니 필요하면 위험하지만 dangerouslySetInnerHTML 사용 고려 */}
          <p>{notice.noticepost}</p>
        </div>
      </div>
    </Layout>
  );
}
