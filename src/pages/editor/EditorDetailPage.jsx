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

export default function EditorDetailPage() {
  const { editorno } = useParams();
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const currentUser = useAuthStore((state) => state.user);

  // 이미지-글 순서대로 렌더링
  const parseContent = (markdown) => {
    const regex = /(!\[([^\]]*)\]\(([^)]+)\))/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(markdown)) !== null) {
      // 이미지 앞 텍스트가 있으면 추가
      if (match.index > lastIndex) {
        let textPart = markdown.slice(lastIndex, match.index);
        // 공백, 띄어쓰기, 줄바꿈만 있는 경우를 제외
        if (textPart.trim().length > 0) {
          textPart = textPart.replace(/<br\s*\/?>/gi, "\n");
          parts.push({ type: "text", content: textPart });
        }
      }

      // 이미지 추가
      parts.push({ type: "image", url: match[3], alt: match[2] });

      lastIndex = regex.lastIndex;
    }

    // 마지막 텍스트 추가
    if (lastIndex < markdown.length) {
      const textPart = markdown.slice(lastIndex).trim();
      if (textPart.length > 0) {
        parts.push({ type: "text", content: textPart });
      }
    }


    return parts;
  };
  // 스크롤 상태 관리
  const [showScrollTop, setShowScrollTop] = useState(false);
  console.log("aaaaaaaaa : ", editor);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
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

  // 댓글 조회
  useEffect(() => {
    if (editorno) fetchComments("editor", editorno);
  }, [editorno]);

  const fetchComments = async (contentType, contentNo) => {
    try {
      const data = await getComments(contentType, contentNo);
      console.log(data);
      setComments(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 댓글 등록
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!currentUser) return alert("로그인 후 이용 가능합니다.");

    const newComment = {
      userno: currentUser.userno,
      commenta: commentText,
    };

    try {
      const saved = await addComment("editor", editor.editorno, newComment);
      console.log("댓글 추가 내용 : ", saved);

      const now = new Date().toISOString();
      // 댓글 목록 업데이트
      setComments((prev) => [
        {
          ...saved,
          reviewno: Number(saved.reviewno),
          username: currentUser.username,
          createdat: saved.createdat || now,
        },
        ...prev,
      ]);

      // 입력창 초기화
      setCommentText("");

      // **수정 모드 초기화**
      setEditingCommentId(null);
      setEditingText("");
    } catch (err) {
      console.error(err);
      alert("댓글 등록 실패");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (reviewno) => {
    const isConfirmed = window.confirm("정말 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      await removeComment(reviewno, "editor");
      setComments(comments.filter((c) => c.reviewno !== reviewno));
      alert("댓글이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      alert("댓글 삭제 실패");
    }
  };

  // 댓글 수정
  const handleEditComment = async (reviewno, newContent) => {
    try {
      await updateComment(reviewno, newContent); // reviewAPI에서 서버 요청
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

  // 댓글 수정 모드 상태
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // 댓글 수정
  const startEditingComment = (reviewno, currentText) => {
    setEditingCommentId(reviewno);
    setEditingText(currentText);
  };

  // 댓글 수정 완료
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
        // 조회수 증가 처리
        // localStorage에서 이미 본 게시글인지 확인
        const viewed = JSON.parse(
          localStorage.getItem("viewedEditors") || "[]"
        );

        if (!viewed.includes(editorno)) {
          // 한번도 안 본 글이면 조회수 증가
          await incrementEditorView(editorno);
          // localStorage에 현재 글 번호 추가
          localStorage.setItem(
            "viewedEditors",
            JSON.stringify([...viewed, editorno])
          );
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
      return (
        <img
          src="${url}"
          alt="${alt}"
          style="max-width:100%; border-radius:8px;"
        />
      );
    });
  };

  return (
    <Layout>
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title="에디터 추천 데이트 코스"
        subtitle="에디터들이 엄선한 코스를 모아봤어요"
        align="left"
        height={600}
        variant="def"
      />
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
        {editor.hashtags && editor.hashtags.length > 0 && (
          <div className="editor-hashtags">
            {editor.hashtags.map((tag, idx) => (
              <span key={idx} className="hashtag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="editor-title-container">
          <p className="editor-title">
            <strong>{editor.editortitle}</strong>
          </p>
          <button
            className={`heart editor-detail-heart ${likes.has(editor.editorno) ? "is-on" : ""
              }`}
            onClick={(e) => {
              e.stopPropagation();
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
          {parseContent(editor.editorcontent).map((part, index) => {
            if (part.type === "image") {
              return (
                <div key={index} className="editor-detail-image">
                  <img src={part.url} alt={part.alt} />
                </div>
              );
            }
            return (
              <p key={index} className="editor-detail-text">
                {part.content}
              </p>
            );
          })}
        </div>
      </div>

      {/* 스크롤 위로 버튼 */}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          ↑
        </button>
      )}

      {/* 댓글창 시작 */}
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
