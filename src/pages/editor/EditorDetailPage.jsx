import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "../../css/EditorDetailPage.css";
import useAuthStore from "../../store/authStore";
import { getPostDetail, deletePost } from "../../service/editorAPI";
import { incrementEditorView } from "../../service/viewAPI";
import { addBookmark, getBookmarks, removeBookmark } from "../../service/bookmarkAPI";


export default function EditorDetailPage() {
  const { editorno } = useParams();
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const currentUser = useAuthStore((state) => state.user);


  // 이미지 태그 추출
  const extractImages = (markdown) => {
    const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      images.push({ alt: match[1], url: match[2] });
    }
    return images;
  };

  // 텍스트만 추출 (이미지 제거)
  const extractText = (markdown) => {
    return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "").trim();
  };

  const images = editor ? extractImages(editor.editorcontent) : [];
  const text = editor ? extractText(editor.editorcontent) : "";

  // 좋아요 상태 Set으로 관리
  const [likes, setLikes] = useState(new Set());

  // 마운트 시 서버에서 좋아요 데이터 가져오기
  useEffect(() => {
    if (!currentUser) return;

    // 현재 로그인한 사용자(currentUser.userno) 기준 북마크를 가져옴
    getBookmarks(currentUser.userno, "editor")
      .then((list) => {
        const editorLikes = list
          // 에디터 콘텐츠만 적용
          .filter((b) => b.contenttype === "editor")
          .map((b) => Number(b.contentno));
        // Set으로 관리해서 각 사용자의 북마크 상태 반영
        setLikes(new Set(editorLikes));
      })
      .catch((err) => console.error("북마크 불러오기 실패:", err));
  }, [currentUser]);

  // 북마크 좋아요 토글
  const toggleLike = async (editorno, e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    const bookmarkData = {
      userno: currentUser.userno,
      contentno: editorno,
      contenttype: "editor",
    };

    const currentlyLiked = likes.has(editorno); // 이전 상태 저장

    try {
      // 서버 호출
      if (currentlyLiked) {
        await removeBookmark(bookmarkData);
      } else {
        await addBookmark(bookmarkData);
      }

      // 상태 업데이트
      setLikes(prev => {
        const newSet = new Set(prev);
        currentlyLiked ? newSet.delete(editorno) : newSet.add(editorno);
        return newSet;
      });
    } catch (err) {
      console.error(err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };


  useEffect(() => {
    const fetchEditor = async () => {

      try {
        // 조회수 증가 처리
        // localStorage에서 이미 본 게시글인지 확인
        const viewed = JSON.parse(localStorage.getItem("viewedEditors") || "[]");

        if (!viewed.includes(editorno)) {
          // 한번도 안 본 글이면 조회수 증가
          await incrementEditorView(editorno);

          // localStorage에 현재 글 번호 추가
          localStorage.setItem("viewedEditors", JSON.stringify([...viewed, editorno]));
        }

        // 상세 데이터 가져오기
        const data = await getPostDetail(editorno);
        setEditor(data);
      } catch (error) {
        console.error("상세 조회 실패:", error);
      }
    };

    fetchEditor();
  }, [editorno]);


  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deletePost(editorno);
        alert("삭제되었습니다.");
        navigate("/editor");
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 실패");
      }
    }
  };


  if (!editor) return <p>로딩중...</p>;

  // 마크다운 이미지 변환 함수
  const renderMarkdownImages = (text) => {
    // ![alt](url) → <img src="url" alt="alt" />
    return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
      return `<img src="${url}" alt="${alt}" style="max-width:100%; border-radius:8px;" />`;
    });
  };

  return (
    <Layout>

      <div className="editor-detail-page">
        <div className="editor-action-wrapper">
          <button onClick={() => navigate("/editor")} className="btnBack">
            목록으로
          </button>
          <div className="editor-action-buttons">
            {currentUser && currentUser.userno === editor.userno && (
              <>
                <button
                  onClick={() => navigate(`/editor/edit/${editor.editorno}`)}
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
        <p><strong>조회수:</strong> {editor.editorview}</p>
        <h4>에디터 추천 데이트코스</h4>

        <div className="editor-title-container">
        <p className="editor-title">
          <strong>{editor.editortitle}</strong>
        </p>
        <button
          className={`heart editor-detail-heart ${likes.has(editor.editorno) ? "is-on" : ""}`}
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭 이벤트와 겹치지 않도록
            toggleLike(editor.editorno, e);
          }}
          title="좋아요"
        >
          ♡
        </button>
        </div>
        <div className="editor-meta">
          <div className="date-info">
            <span>
              <strong>작성일:</strong> {editor.editordate}
            </span>
            <span className="separator"> / </span>
            <span>
              <strong>수정일:</strong> {editor.editorupdatedate}
            </span>
          </div>
        </div>

        <div className="editor-detail-container">
          {/* 이미지 영역 */}
          <div className="editor-detail-image">
            {extractImages(editor.editorcontent).map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.alt}
                style={{
                  maxWidth: "100%",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            ))}
          </div>

          {/* 글 영역 */}
          <div className="editor-detail-info">
            {extractText(editor.editorcontent) || null}
          </div>
        </div>
      </div>

    </Layout>
  );
}
