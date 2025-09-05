// src/pages/editor/EditorDetailPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "../../css/EditorDetailPage.css";
import useAuthStore from "../../store/authStore";
import { getPostDetail, deletePost } from "../../service/editorAPI";
import { incrementEditorView } from "../../service/viewAPI";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../../service/bookmarkAPI";
import {
  getComments,
  addComment,
  updateComment,
  removeComment,
} from "../../service/reviewAPI";
import HeroStrip from "../../components/HeroStrip";
import MY_PAGE_HERO from "../../img/my-page.jpg";

/**
 * 에디터 상세 페이지
 * - 추천 데이트 코스 상세 / 이미지 / 본문 / 댓글
 * - 조회수 증가, 북마크(좋아요) 토글, 수정/삭제
 */

export default function EditorDetailPage() {
  const { editorno } = useParams();
  const navigate = useNavigate();

  const currentUser = useAuthStore((state) => state.user);

  const [editor, setEditor] = useState(null);

  // 댓글
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // 좋아요 상태 (해당 사용자의 editor 북마크 집합)
  const [likes, setLikes] = useState(new Set());

  // -----------------------------
  // 댓글 로드 / CRUD
  // -----------------------------
  useEffect(() => {
    if (!editorno) return;
    fetchComments("editor", editorno);
  }, [editorno]);

  const fetchComments = async (contentType, contentNo) => {
    try {
      const data = await getComments(contentType, contentNo);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!currentUser) return alert("로그인 후 이용 가능합니다.");
    if (!editor) return;

    const newComment = {
      userno: currentUser.userno,
      commenta: commentText,
    };

    try {
      const saved = await addComment("editor", editor.editorno, newComment);
      setComments((prev) => [
        { ...saved, reviewno: Number(saved.reviewno) },
        ...prev,
      ]);
      setCommentText("");
      setEditingCommentId(null);
      setEditingText("");
    } catch (err) {
      console.error(err);
      alert("댓글 등록 실패");
    }
  };

  const handleDeleteComment = async (reviewno) => {
    const isConfirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!isConfirmed) return;
    try {
      await removeComment(reviewno, "editor");
      setComments((prev) => prev.filter((c) => c.reviewno !== reviewno));
      alert("댓글이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      alert("댓글 삭제 실패");
    }
  };

  const handleEditComment = async (reviewno, newContent) => {
    try {
      await updateComment(reviewno, newContent);
      setComments((prev) =>
        prev.map((c) =>
          c.reviewno === reviewno ? { ...c, commenta: newContent } : c
        )
      );
    } catch (err) {
      console.error(err);
      alert("댓글 수정 실패");
    }
  };

  const startEditingComment = (reviewno, currentText) => {
    setEditingCommentId(reviewno);
    setEditingText(currentText || "");
  };

  const submitEditComment = async (reviewno) => {
    try {
      await handleEditComment(reviewno, editingText);
      setEditingCommentId(null);
      setEditingText("");
    } catch (err) {
      console.error(err);
      alert("댓글 수정 실패");
    }
  };

  // -----------------------------
  // 본문 Markdown에서 이미지/텍스트 추출
  // -----------------------------
  const extractImages = (markdown = "") => {
    const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      images.push({ alt: match[1], url: match[2] });
    }
    return images;
  };

  const extractText = (markdown = "") =>
    markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "").trim();

  // -----------------------------
  // 북마크(좋아요) 초기 로드
  // -----------------------------
  useEffect(() => {
    if (!currentUser) {
      setLikes(new Set());
      return;
    }
    getBookmarks(currentUser.userno, "editor")
      .then((list) => {
        const editorLikes = (list || [])
          .filter((b) => b.contenttype === "editor")
          .map((b) => Number(b.contentno));
        setLikes(new Set(editorLikes));
      })
      .catch((err) => console.error("북마크 불러오기 실패:", err));
  }, [currentUser]);

  // 좋아요 토글
  const toggleLike = async (targetEditorNo, e) => {
    e?.stopPropagation?.();
    if (!currentUser) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    const bookmarkData = {
      userno: currentUser.userno,
      contentno: targetEditorNo,
      contenttype: "editor",
    };

    const currentlyLiked = likes.has(targetEditorNo);

    try {
      if (currentlyLiked) {
        await removeBookmark(bookmarkData);
      } else {
        await addBookmark(bookmarkData);
      }
      setLikes((prev) => {
        const next = new Set(prev);
        currentlyLiked ? next.delete(targetEditorNo) : next.add(targetEditorNo);
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  // -----------------------------
  // 상세/조회수
  // -----------------------------
  useEffect(() => {
    const fetchEditor = async () => {
      try {
        // 조회수 증가 (중복 방지: localStorage)
        const viewed = JSON.parse(
          localStorage.getItem("viewedEditors") || "[]"
        );
        if (!viewed.includes(editorno)) {
          await incrementEditorView(editorno);
          localStorage.setItem(
            "viewedEditors",
            JSON.stringify([...viewed, editorno])
          );
        }

        // 상세 데이터
        const res = await getPostDetail(editorno);
        const data = res?.data || res; // 방어코드: axios/직접객체 모두 대응
        setEditor(data);
      } catch (error) {
        console.error("상세 조회 실패:", error);
      }
    };
    if (editorno) fetchEditor();
  }, [editorno]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deletePost(editorno);
      alert("삭제되었습니다.");
      navigate("/editor");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 실패");
    }
  };

  if (!editor) {
    return (
      <Layout>
        <HeroStrip
          imageSrc={MY_PAGE_HERO}
          title="에디터 상세"
          subtitle="게시글을 불러오는 중입니다…"
          align="left"
          height={600}
          variant="def"
        />
        <p style={{ padding: "16px" }}>로딩중...</p>
      </Layout>
    );
  }

  const images = extractImages(editor.editorcontent);
  const text = extractText(editor.editorcontent);

  return (
    <Layout>
      {/* ✅ 상단 히어로 */}
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title={editor.editortitle || "에디터 상세"}
        subtitle="에디터가 추천한 데이트 코스를 확인해보세요"
        align="left"
        height={600}
        variant="def"
      />

      <div className="editor-detail-page">
        {/* 상단 액션 */}
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

        {/* 메타 */}
        <p>
          <strong>조회수:</strong> {editor.editorview}
        </p>

        <div className="editor-title-container">
          <p className="editor-title">
            <strong>{editor.editortitle}</strong>
          </p>
          <button
            className={`heart editor-detail-heart ${
              likes.has(editor.editorno) ? "is-on" : ""
            }`}
            onClick={(e) => toggleLike(editor.editorno, e)}
            title="좋아요"
            aria-label="좋아요"
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

        {/* 본문 */}
        <div className="editor-detail-container">
          {/* 이미지 영역 */}
          <div className="editor-detail-image">
            {images.map((img, idx) => (
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
          <div className="editor-detail-info">{text || null}</div>
        </div>
      </div>

      {/* 댓글 영역 */}
      <div className="comment-section">
        <div className="comment-input">
          <textarea
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button onClick={handleAddComment}>등록</button>
        </div>

        <ul className="comment-list">
          {comments.map((comment) => {
            const isEditing =
              Number(editingCommentId) === Number(comment.reviewno);
            const isOwner =
              currentUser && currentUser.userno === comment.userno;
            return (
              <li key={comment.reviewno} className="comment-item">
                <div className="comment-header">
                  <span className="comment-userno">{comment.username}</span>
                  <span className="comment-createdat">{comment.createdat}</span>
                </div>

                <div className="comment-content">
                  {isEditing ? (
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                  ) : (
                    comment.commenta || ""
                  )}
                </div>

                {isOwner && (
                  <div className="comment-actions">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => submitEditComment(comment.reviewno)}
                          className="btnEditComment"
                        >
                          완료
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditingText("");
                          }}
                          className="btnDeleteComment"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            startEditingComment(
                              comment.reviewno,
                              comment.commenta
                            )
                          }
                          className="btnEditComment"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.reviewno)}
                          className="btnDeleteComment"
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
}
