// src/components/CafeViewPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../css/CafePage.css"; // 공통 스타일
import "../../css/CafeViewPage.css"; // 상세 페이지 스타일
import { getRestInfo } from "../../service/restAPI"; // 레스토랑 정보 API
import { addBookmark, getBookmarks, removeBookmark } from "../../service/bookmarkAPI";
import useAuthStore from "../../store/authStore";
import "../../css/EditorDetailPage.css";
import {
    getComments,
    addComment,
    updateComment,
    removeComment,
  } from "../../service/reviewAPI";


// 정보 항목을 간결하게 표시하는 작은 컴포넌트
const InfoItem = ({ label, value }) => {
  // value(값)가 있을 때만 항목을 보여줍니다.
  if (!value) return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
};

// CafeViewPage 컴포넌트
export default function RestViewPage() {
  // 주소창에서 레스토랑 이름과 지점명, 번호를 가져옵니다.
  const {restNo } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const [likes, setLikes] = useState(() => new Set());
  
  // 상태 관리: 데이터를 담을 공간, 로딩 상태, 에러 메시지
  const [rest, setRest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 페이지가 로딩될 때마다 맨 위로 스크롤합니다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [restNo]); // cafeNo가 변경될 때도 스크롤하도록 추가

  // 컴포넌트가 처음 렌더링되거나 URL 파라미터가 변경될 때마다 API를 호출합니다.
  useEffect(() => {
    // 비동기 작업 중 페이지 이동을 방지하기 위한 플래그
    let alive = true;
    
    (async () => {
      try {
        setLoading(true); // 로딩 시작
        // cafeNo를 사용하여 상세 정보를 가져옵니다.
        const raw = await getRestInfo({ restNo: Number(restNo) }); // cafeNo로 API 호출
        
        if (!alive) return; // 페이지를 벗어났으면 아무것도 하지 않습니다.
        
        setRest(raw); // 데이터를 상태에 저장
        setError(""); // 에러 초기화
      } catch (e) {
        if (!alive) return;
        console.error("Failed to fetch rest info:", e); // 에러 로그
        setError("상세 정보를 불러오지 못했어요."); // 에러 메시지 설정
      } finally {
        if (alive) setLoading(false); // 로딩 종료
      }
    })();
    
    // 컴포넌트가 사라질 때 실행될 정리 함수
    return () => {
      alive = false;
    };
  }, [restNo]); // cafeNo가 변경될 때만 API를 호출하도록 의존성 배열 수정

  
  // 댓글
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  // 댓글 조회
  useEffect(() => {
    if (restNo) fetchComments("restaurant", restNo);
  }, [restNo]);

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
      const saved = await addComment("restaurant", rest.restNo, newComment);
      console.log("댓글 추가 내용 : ", saved);

      // 댓글 목록 업데이트
      setComments((prev) => [
        {
          ...saved,
          reviewno: Number(saved.reviewno),
          username: currentUser.username,
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
      await removeComment(reviewno, "restaurant");
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
  // 마운트 시 서버에서 좋아요 데이터 가져오기
  useEffect(() => {
    if (!currentUser) return;

    getBookmarks(currentUser.userno, "restaurant") // "place"를 "cafes"로 수정
      .then((list) => {
        const restLikes = list
          .filter((b) => b.contenttype === "restaurant") // "place"를 "cafes"로 수정
          .map((b) => Number(b.contentno));
        setLikes(new Set(restLikes));
      })
      .catch((err) => console.error("북마크 불러오기 실패:", err));
  }, [currentUser]);

  // 북마크 좋아요 토글
  const toggleLike = async (restNo, e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    const bookmarkData = {
      userno: currentUser.userno,
      contentno: restNo,
      contenttype: "restaurant", // "place"를 "cafes"로 수정
    };

    const currentlyLiked = likes.has(restNo); // 이전 상태 저장

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
        currentlyLiked ? newSet.delete(restNo) : newSet.add(restNo);
        return newSet;
      });
    } catch (err) {
      console.error(err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };
  
  // 이미지 URL을 메모리에 저장 (한 번만 계산)
  const imgs = useMemo(() => {
    const thumbUrl = rest?.restImgAddress || "https://picsum.photos/1200/800?blur=2";
    return [thumbUrl];
  }, [rest]);

  // 로딩 중일 때 보여줄 화면
  if (loading) {
    return (
      <div className="page cv-wrap">
        <div className="cv-skel hero" />
        <div className="cv-skel text" />
      </div>
    );
  }

  // 에러가 있거나 데이터가 없을 때 보여줄 화면
  if (error || !rest) {
    return (
      <div className="page cv-wrap">
        <p className="cv-error">{error || "데이터가 없습니다."}</p>
        <div className="cv-footnav">
          <Link to="/restaurants" className="cv-btn">
            목록으로
          </Link>
        </div>
      </div>
    );
  }

  // 데이터가 성공적으로 로딩되었을 때 보여줄 화면
  return (
    <div className="page cv-wrap">
      <div className="cv-topline center">
        {rest.restName && <span className="cv-chip">{rest.restName}</span>}
        {rest.restBranch && <span className="cv-chip">{rest.restBranch}</span>}
      </div>

      <h1 className="cv-title center">{rest.restName} {rest.restBranch} 
         <button
        className={`hearts editor-detail-hearts ${likes.has(rest.restNo) ? "is-on" : ""}`}
        onClick={(e) => {
          e.stopPropagation(); // 카드 클릭 이벤트와 겹치지 않도록
          toggleLike(rest.restNo, e); // data.cafeNo를 인자로 전달
        }}
        title="좋아요"
      >
        ♡
      </button>
      
</h1>

      <div className="cv-heroimg">
        <img src={imgs[0]} alt={rest.restName} />
      </div>

      <section className="cv-card">
        <dl className="cv-dl">
          <InfoItem label="주소" value={rest.restAddress} />
          <InfoItem label="전화번호" value={rest.restPhonNumber} />
          <InfoItem label="종류" value={rest.restType} />
          <InfoItem label="영업 시간" value={rest.restOpen} />
          <InfoItem label="지역" value={rest.restRegion} />
          <InfoItem label="평점" value={rest.restRating} />

          {/* 웹사이트 URL (링크로 표시) */}
          {rest.restWebsite && (
            <>
              <dt>웹사이트</dt>
              <dd>
                <a
                  className="cv-link"
                  href={rest.restWebsite}
                  target="_blank"
                  rel="noreferrer"
                >
                  {rest.restWebsite}
                </a>
              </dd>
            </>
          )}

          {/* 지도 URL (지도 임베드로 표시) */}
          {rest.restMapUrl && (
            <>
              <dt>지도</dt>
              <dd>
                <div className="cv-mapbox">
                  <iframe
                    title="rest-map"
                    src={rest.restMapUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                  ></iframe>
                </div>
              </dd>
            </>
          )}
        </dl>
      </section>

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
      {/* 목록으로 돌아가는 버튼 */}
      <div className="cv-footnav">
        <Link to="/restaurants" className="cv-btn">
          목록으로
        </Link>
      </div>
    </div>
  );
}