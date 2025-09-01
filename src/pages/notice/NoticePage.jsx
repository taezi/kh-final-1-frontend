import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../css/NoticePage.css";
import { getNoticeList, noticeAPI } from "../../service/noticeAPI";
import useAuthStore from "../../store/authStore";

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
        const response = await getNoticeList(page, PAGE_SIZE);
        console.log("noticeList:", response.nList);
        setNoticeList(response.nList);
        setTotalPages(Math.ceil(response.total / PAGE_SIZE));
      } catch (error) {
        console.error("공지사항 조회 실패:", error);
      }
    };

    fetchData();
  }, [page]);

  // 공지 상세페이지 이동
  const goToDetail = (noticeno) => {
    navigate(`/notice/${noticeno}`);
  };

  // 글 작성 페이지 이동
  const handleClick = () => {
    navigate("/noticeWrite");
  };

  return (
    <Layout>
      <div className="notice-page">
        <div className="notice-header">
          <h3>공지사항 페이지</h3>
          {user?.role === "admin" ? (
            <button className="register-btn" onClick={handleClick}>
              등록
            </button>
          ) : (
            <></>
          )}
        </div>
        {/* 리스트 */}
        <table className="notice-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>내용</th>
              <th>작성일</th>
              <th>조회수</th>
            </tr>
          </thead>

          <tbody>
            {noticeList.map((notice) => (
              <tr
                key={notice.noticeno}
                onClick={() => goToDetail(notice.noticeno)}
                className="notice-row"
              >
                <td>{notice.noticeno}</td>
                <td className="title">{notice.noticetitle}</td>
                <td
                  style={{
                    maxWidth: '300px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>{notice.noticepost}</td>
                <td>{notice.noticedate}</td>
                <td>{notice.noticeview}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              className={page === idx + 1 ? "active" : ""}
              onClick={() => setPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
