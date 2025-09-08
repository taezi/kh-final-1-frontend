import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../css/EditorPage.css";
import useAuthStore from "../../store/authStore";
import { getPostList } from "../../service/editorAPI";
import defaultImage from "../../img/save-image.png";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../../service/bookmarkAPI";

// ✅ HeroStrip 추가
import HeroStrip from "../../components/HeroStrip";
import MY_PAGE_HERO from "../../img/my-page.jpg";

export default function EditorPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [editorList, setEditorList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // ✅ 선택된 해시태그 상태
  const [selectedTag, setSelectedTag] = useState("");

  // 좋아요(북마크) 상태: Set으로 관리 (editorno 보관)
  const [likes, setLikes] = useState(new Set());
  console.log("editorList : ", editorList);

  // 리스트 로드 함수 (검색/페이지 공통)
  const loadList = async (p = 1, keyword = "") => {
    try {
      const response = await getPostList(keyword);
      const allItems = (response?.eList || []).map((editor) => ({
        ...editor,
      }));

      // 9개씩 잘라서 보여주기
      const start = (p - 1) * 9;
      const newItems = allItems.slice(start, start + 9);

      setEditorList((prev) => (p === 1 ? newItems : [...prev, ...newItems]));

      // 더보기 여부
      setHasMore(start + newItems.length < allItems.length);

      setPage(p);
    } catch (error) {
      console.error("게시글 불러오기 실패:", error);
      if (p === 1) {
        setEditorList([]);
        setHasMore(false);
      }
    }
  };

  // 초기 1페이지 로드
  useEffect(() => {
    loadList(1);
  }, []);

  // 글 작성 페이지 이동
  const handleClick = () => {
    navigate("/editorWrite");
  };

  // 검색
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      await loadList(1, searchKeyword);
    } catch (err) {
      console.error("검색 실패:", err);
    }
  };

  // 마운트 시 현재 사용자 북마크(좋아요) 불러오기
  useEffect(() => {
    if (!user) {
      setLikes(new Set());
      return;
    }
    getBookmarks(user.userno, "editor")
      .then((list) => {
        const editorLikes = list
          .filter((b) => b.contenttype === "editor")
          .map((b) => Number(b.contentno));
        setLikes(new Set(editorLikes));
      })
      .catch((err) => console.error("북마크 불러오기 실패:", err));
  }, [user]);

  // 북마크 토글
  const toggleLike = async (editorno, e) => {
    e.stopPropagation();
    if (!user) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    const bookmarkData = {
      userno: user.userno,
      contentno: editorno,
      contenttype: "editor",
    };

    const currentlyLiked = likes.has(editorno);

    try {
      if (currentlyLiked) {
        await removeBookmark(bookmarkData);
      } else {
        await addBookmark(bookmarkData);
      }

      setLikes((prev) => {
        const newSet = new Set(prev);
        currentlyLiked ? newSet.delete(editorno) : newSet.add(editorno);
        return newSet;
      });
    } catch (err) {
      console.error(err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  // 카드 클릭 → 상세 페이지 이동
  const goToDetail = (editorno) => {
    navigate(`/editor/${editorno}`);
  };

  // ✅ 해시태그 버튼 클릭 시 필터링
  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(""); // 다시 클릭하면 전체보기
    } else {
      setSelectedTag(tag);
    }
  };

  // ✅ 선택된 태그가 있으면 필터링된 리스트 사용
  const filteredList = selectedTag
    ? editorList.filter((editor) =>
        editor.hashtags?.some((t) => {
          if (typeof t === "string") return t === selectedTag; // 문자열 배열일 경우
          return t.tagname === selectedTag; // 객체 배열일 경우
        })
      )
    : editorList;

  return (
    <Layout>
      {/* ✅ 상단 히어로 배너 */}
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title="에디터 추천 데이트 코스"
        subtitle="에디터들이 엄선한 코스를 모아봤어요"
        align="left"
        height={600}
        variant="def"
      />

      <div className="editor-page">
        {/* 헤더 */}
        <div className="editor-header">
          <h3>에디터 추천 데이트 코스</h3>
          {user?.role === "editor" ? (
            <button className="register-btn" onClick={handleClick}>
              등록
            </button>
          ) : null}
        </div>

        {/* ✅ 해시태그 버튼 */}
        <div className="hashtag-container">
          {[
            "계절",
            "BEST",
            "공원/산책/자연",
            "문화/예술",
            "카페/먹거리",
            "전망/야경/드라이브",
            "스포츠/활동",
            "로맨스/테마데이트",
          ].map((tag) => (
            <button
              key={tag}
              className={`hashtag ${selectedTag === tag ? "active" : ""}`}
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </button>
          ))}
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
          <button type="submit" className="search-icon-btn" aria-label="검색" />
        </form>

        {/* 게시글 카드 리스트 */}
        <div className="editor-grid">
          {filteredList.map((editor) => (
            <div
              key={editor.editorno}
              className="editor-card"
              onClick={() => goToDetail(editor.editorno)}
            >
              <div className="editor-image">
                <img
                  src={editor.thumbnailUrl || defaultImage}
                  alt={editor.editortitle}
                />
                <button
                  className={`heart ${
                    likes.has(editor.editorno) ? "is-on" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(editor.editorno, e);
                  }}
                  title="좋아요"
                  aria-label="좋아요"
                >
                  ♡
                </button>
              </div>
              <div className="editor-info">
                <h4>{editor.editortitle}</h4>
                {/* ✅ 해시태그 목록 */}
                <div className="hashtags-list">
                  {editor.hashtags &&
                    editor.hashtags.map((tag, idx) => (
                      <span
                        key={`${editor.editorno}-${idx}`}
                        className="tag-pill"
                      >
                        #{typeof tag === "string" ? tag : tag.tagname}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 더보기 */}
        <div className="load-more">
          {hasMore ? (
            <button onClick={() => loadList(page + 1)}>더보기</button>
          ) : (
            <button
              onClick={() => {
                setSearchKeyword("");
                setSelectedTag(""); // 선택된 태그 초기화
                loadList(1, "");
              }}
            >
              목록으로 가기
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
