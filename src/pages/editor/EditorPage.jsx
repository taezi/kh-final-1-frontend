import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../css/EditorPage.css";
import useAuthStore from "../../store/authStore";
import { getPostList } from "../../service/editorAPI";
import defaultImage from "../../img/save-image.png";

export default function EditorPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [editorList, setEditorList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // 리스트 로드 함수
  const loadList = async (p = 1) => {
    try {
      const response = await getPostList();
      const allItems = response.eList.map((editor) => ({
        ...editor,
        liked: false,
      }));

      // 6개씩 잘라서 보여주기
      const start = (p - 1) * 6;
      const newItems = allItems.slice(start, start + 6);

      setEditorList((prev) => (p === 1 ? newItems : [...prev, ...newItems]));

      // 더보기 여부
      setHasMore(allItems.length > start + 6);
      setPage(p);
    } catch (error) {
      console.error("게시글 불러오기 실패:", error);
      if (p === 1) {
        setEditorList([]);
        setHasMore(false);
      }
    }
  };

  // ✅ 초기 게시글 로드 (1페이지)
  useEffect(() => {
    loadList(1);
  }, []);

  // 글 작성 페이지 이동
  const handleClick = () => {
    navigate("/editorWrite");
  };

  // 검색
  const handleSearch = async (e) => {
  e.preventDefault(); // 폼 제출 시 새로고침 방지
  console.log("검색어:", searchKeyword);

  try {
    const res = await getPostList(searchKeyword); 
    setEditorList(res.eList.map(x => ({ ...x, liked: false }))); // eList 바로 사용
    setPage(1); // 페이지 초기화
  } catch (err) {
    console.error("검색 실패:", err);
  }
};

  // 좋아요 토글
  const toggleLike = (editorno, e) => {
    e.stopPropagation();
    setEditorList((prev) =>
      prev.map((editor) =>
        editor.editorno === editorno
          ? { ...editor, liked: !editor.liked }
          : editor
      )
    );
  };

  // 카드 클릭 → 상세 페이지 이동
  const goToDetail = (editorno) => {
    navigate(`/editor/${editorno}`);
  };

  return (
    <Layout>
      <div className="editor-page">
        {/* 헤더 */}
        <div className="editor-header">
          <h3>에디터 추천 데이트 코스</h3>
          {user?.role === "editor" ? (
            <button className="register-btn" onClick={handleClick}>
              등록
            </button>
          ) : (
            <></>
          )}
        </div>

        {/* 검색창 */}
        <form className="editor-search" onSubmit={handleSearch}>
          <input
            type="text"
              className="editor-search-input"
            placeholder="키워드 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button type="submit" className="search-icon-btn">
          </button>
        </form>

        {/* 게시글 카드 리스트 */}
        <div className="editor-grid">
          {editorList.map((editor) => (
            <div
              key={editor.editorno}
              className="editor-card"
              onClick={() => goToDetail(editor.editorno)}
            >
              <div className="editor-image">
                <img
                  src={editor.thumbnailUrl || defaultImage} // ✅ 변경: thumbnail → thumbnailUrl
                  alt={editor.editortitle}
                />
                <button
                  className="like-btn"
                  onClick={(e) => toggleLike(editor.editorno, e)}
                >
                  {editor.liked ? "❤️" : "♡"}
                </button>
              </div>
              <div className="editor-info">
                <h4>{editor.editortitle}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="load-more">
          {hasMore ? (
            <button onClick={() => loadList(page + 1)}>더보기</button>
          ) : (
            <button disabled>더보기</button>
          )}
        </div>
      </div>
    </Layout>
  );
}
