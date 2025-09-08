// src/pages/notice/NoticePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../css/NoticePage.css";
import { getNoticeList } from "../../service/noticeAPI";
import useAuthStore from "../../store/authStore";

import HeroStrip from "../../components/HeroStrip";
import MY_PAGE_HERO from "../../img/my-page.jpg";

export default function NoticePage() {
  const navigate = useNavigate();
  const [noticeList, setNoticeList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
  const user = useAuthStore((state) => state.user);

  const PAGE_SIZE = 10; // 한 페이지에 10건

  // 공지사항 리스트 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getNoticeList(page, PAGE_SIZE);
        const nList = res?.nList || [];
        const total = Number(res?.total || nList.length);
        setNoticeList(nList);
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } catch (error) {
        console.error("공지사항 조회 실패:", error);
        setNoticeList([]);
        setTotalPages(1);
      }
    };
    fetchData();
  }, [page]);

  // 상세 페이지 이동
  const goToDetail = (noticeno) => {
    navigate(`/notice/${noticeno}`);
  };

  // 글 작성 페이지 이동
  const handleClick = () => {
    navigate("/noticeWrite");
  };

  return (
    <Layout>
      {/* ✅ 상단 히어로 */}
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title="공지사항"
        subtitle="서비스 업데이트와 중요한 안내를 확인하세요"
        align="left"
        height={600}
        variant="def"
      />

      <div className="notice-page">
        <div className="notice-header">
          <h3>공지사항 페이지</h3>
          {user?.role === "admin" ? (
            <button className="register-btn" onClick={handleClick}>
              등록
            </button>
          ) : null}
        </div>

        {/* 리스트 */}
        <table className="notice-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성일</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {noticeList.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "24px" }}
                >
                  공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              noticeList.map((notice) => (
                <tr
                  key={notice.noticeno}
                  onClick={() => goToDetail(notice.noticeno)}
                  className="notice-row"
                >
                  <td>{notice.noticeno}</td>
                  <td className="title">{notice.noticetitle}</td>
                  <td>{notice.noticedate}</td>
                  <td>{notice.noticeview}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                className={page === pageNum ? "active" : ""}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
