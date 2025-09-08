import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import "../../css/EditorDetailPage.css";
import useAuthStore from "../../store/authStore";
import { getPostDetail, deletePost } from "../../service/editorAPI";
import { incrementEditorView } from "../../service/viewAPI";
import { addBookmark, getBookmarks, removeBookmark } from "../../service/bookmarkAPI";
import { getComments, addComment, updateComment, removeComment } from "../../service/reviewAPI";

export default function EditorDetailPage() {
  const { editorno } = useParams();
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const currentUser = useAuthStore((state) => state.user);

  // 스크롤 상태 관리
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 스크롤 맨 위로 올리기
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 댓글
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (editorno) fetchComments("editor", editorno);
  }, [editorno]);

  const fetchComments = async (contentType, contentNo) => {
    try {
      const data = await getComments(contentType, contentNo);
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!currentUser) return alert("로그인 후 이용 가능합니다.");

    const newComment = {
      userno: currentUser.userno,
      commenta: commentText,
    };

    try {
      const saved = await addComment("editor", editor.editorno, newComment);
      setComments((prev) => [
        {
          ...saved,
          reviewno: Number(saved.reviewno),
          username: currentUser.username,
        },
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
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await removeComment(reviewno, "editor");
      setComments(comments.filter((c) => c.reviewno !== reviewno));
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

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const startEditingComment = (reviewno, currentText) => {
    setEditingCommentId(reviewno);
    setEditingText(currentText);
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

  // 좋아요 상태
  const [likes, setLikes] = useState(new Set());

  useEffect(() => {
    if (!currentUser) return;
    getBookmarks(currentUser.userno, "editor")
      .then((list) => {
        const editorLikes = list
          .filter((b) => b.contenttype === "editor")
          .map((b) => Number(b.contentno));
        setLikes(new Set(editorLikes));
      })
      .catch((err) => console.error("북마크 불러오기 실패:", err));
  }, [currentUser]);

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

  useEffect(() => {
    const fetchEditor = async () => {
      try {
        const viewed = JSON.parse(localStorage.getItem("viewedEditors") || "[]");
        if (!viewed.includes(editorno)) {
          await incrementEditorView(editorno);
          localStorage.setItem(
            "viewedEditors",
            JSON.stringify([...viewed, editorno])
          );
        }
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

  // Markdown 파싱
  const parseContent = (markdown) => {
    const regex = /(!\[([^\]]*)\]\(([^)]+)\))/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      if (match.index > lastIndex) {
        const textPart = markdown.slice(lastIndex, match.index).trim();
        if (textPart) parts.push({ type: "text", content: textPart });
      }
      parts.push({ type: "image", url: match[3], alt: match[2] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < markdown.length) {
      const textPart = markdown.slice(lastIndex).trim();
      if (textPart) parts.push({ type: "text", content: textPart });
    }
    return parts;
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

        <p>
          <strong>조회수:</strong> {editor.editorview}
        </p>
        <h4>에디터 추천 데이트코스</h4>

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
          {parseContent(editor.editorcontent).map((part, idx) =>
            part.type === "image" ? (
              <img
                key={idx}
                src={part.url}
                alt={part.alt}
                style={{
                  maxWidth: "100%",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
            ) : (
              <p key={idx} className="editor-detail-text">
                {part.content.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            )
          )}
        </div>
      </div>

      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}

      {/* 댓글창 */}
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
          {comments.map((comment) => (
            <li key={comment.reviewno} className="comment-item">
              <div className="comment-header">
                <span className="comment-userno">{comment.username}</span>
                <span className="comment-createdat">{comment.createdat}</span>
              </div>

              <div className="comment-content">
                {editingCommentId === Number(comment.reviewno) ? (
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                ) : (
                  comment.commenta || ""
                )}
              </div>

              {currentUser && currentUser.userno === comment.userno && (
                <div className="comment-actions">
                  {editingCommentId === comment.reviewno ? (
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
          ))}
        </ul>
      </div>
    </Layout>
  );
}
