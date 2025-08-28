import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../css/EditorPage.css";
import useAuthStore from "../store/authStore";
import { editorAPI } from "../service/editorAPI";
import defaultImage from "../img/editor.png";


export default function EditorPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [editorList, setEditorList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);

  // 초기 게시글 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await editorAPI.get(`/list?page=${page}`);
        const listWithLike = response.data.eList.map((editor) => ({
          ...editor,
          liked: false,
        }));
        setEditorList(listWithLike);
      } catch (error) {
        console.error("게시글 조회 실패:", error);
      }
    };
    fetchData();
  }, []);

  // 글 작성 페이지 이동
  const handleClick = () => {
    navigate("/editorWrite");
  };

  // 검색
  const handleSearch = () => {
    console.log("검색어:", searchKeyword);
    // 실제로는 API 호출 또는 editorList 필터링
  };

  // 좋아요 토글
  const toggleLike = (editorno, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
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

  // 더보기 버튼
  const loadMore = async () => {
    try {
      const response = await editorAPI.get(`/list?page=${page + 1}`);
      const newList = response.data.eList.map((editor) => ({
        ...editor,
        liked: false,
      }));
      setEditorList((prev) => [...prev, ...newList]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("더보기 실패:", error);
    }
  };

  return (
    <Layout>
      <div className="editor-page">
        {/* 헤더 */}
        <div className="editor-header">
          <h3>에디터 추천 데이트 코스</h3>
          {user?.role === "editor" ? (
            <>
              <button className="register-btn" onClick={handleClick}>
                등록
              </button>
            </>
          ) : (
            <></>
          )}
        </div>

        {/* 검색창 */}
        <div className="editor-search">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button onClick={handleSearch}>검색</button>
        </div>

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
                  src={editor.thumbnail || defaultImage}
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

        {/* 더보기 버튼 */}
        <div className="load-more">
          <button onClick={loadMore}>더보기</button>
        </div>
      </div>
    </Layout>
  );
}
