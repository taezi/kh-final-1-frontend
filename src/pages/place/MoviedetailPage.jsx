import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../../css/MovieDetailPage.css";
import useAuthStore from "../../store/authStore";

const TMDB_API_KEY = "674c3b16235176789e8ad2f9fee1a760";

const fetchMovieDetail = async (movieId) => {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ko-KR`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const trailerUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`;
    const trailerResponse = await fetch(trailerUrl);
    const trailerData = await trailerResponse.json();

    const youtubeTrailer = trailerData.results.find(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    );

    return {
      id: data.id,
      title: data.title,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      release_date: data.release_date,
      vote_average: data.vote_average,
      overview: data.overview,
      trailer_key: youtubeTrailer ? youtubeTrailer.key : null,
    };
  } catch (error) {
    console.error("영화 상세 데이터 로드 실패:", error);
    return null;
  }
};

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // 수정 기능 관련 상태 추가
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewText, setEditingReviewText] = useState("");

  const { user, accessToken, setUser } = useAuthStore(); // setUser 함수 추가
  const isLoggedIn = !!user;

  const fetchReviews = async () => {
    try {
      const headers = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const config = accessToken ? { headers } : {};

      const response = await axios.get(`http://localhost:9999/api/movie/review/${id}`, config);
      setReviews(response.data);
      
      console.log("--- 리뷰 데이터 불러오기 완료 ---");
      console.log("로그인 상태:", isLoggedIn);
      console.log("현재 로그인 사용자:", user);
      console.log("불러온 리뷰 목록:", response.data);
      console.log("-------------------------------");

    } catch (error) {
      console.error("리뷰를 불러오는 중 오류가 발생했습니다:", error);
    }
  };

  const fetchUserInfo = async () => {
    // JWT 토큰이 있지만 사용자 정보가 없는 경우에만 실행
    if (accessToken && !user) {
      try {
        const response = await axios.get("http://localhost:9999/api/user/info", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        // 서버에서 받아온 사용자 정보를 전역 상태에 저장
        setUser(response.data);
        console.log("새로 불러온 사용자 정보:", response.data);
      } catch (error) {
        console.error("사용자 정보 로드 실패:", error);
        // 토큰이 유효하지 않으면 로그아웃 처리
        useAuthStore.getState().logout();
      }
    }
  };

  useEffect(() => {
    const getMovieDetail = async () => {
      setLoading(true);
      const movieData = await fetchMovieDetail(id);
      if (movieData) {
        setMovie(movieData);
      }
      setLoading(false);
    };

    if (id) {
      getMovieDetail();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReviews();
      fetchUserInfo(); // 리뷰 불러올 때 사용자 정보도 함께 확인
    }
  }, [id, accessToken]); // accessToken이 변경될 때마다 실행

  const toggleReview = () => {
    setIsReviewOpen(!isReviewOpen);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhoto(null);
      setPhotoPreview(null);
    }
  };

  const handleReviewSubmit = async () => {
    if (!isLoggedIn) {
      alert("로그인해야 리뷰를 등록하실 수 있습니다.");
      return;
    }

    if (!reviewText.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    console.log("JWT 토큰:", accessToken);

    const reviewData = {
      userNo: user?.userno,
      commentA: reviewText,
      contentType: "movie",
      contentNo: parseInt(id),
    };

    try {
      await axios.post("http://localhost:9999/api/movie/review", reviewData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      alert("리뷰 등록을 완료했습니다.");

      setReviewText("");
      setPhoto(null);
      setPhotoPreview(null);
      fetchReviews();
    } catch (error) {
      console.error("리뷰 등록 중 오류가 발생했습니다:", error);
      alert(
        `리뷰 등록에 실패했습니다: ${error.response?.data || error.message}`
      );
    }
  };

  const handleDeleteReview = async (reviewNo) => {
    if (!window.confirm("정말 리뷰를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      await axios.delete(`http://localhost:9999/api/movie/review/${reviewNo}`, { headers });
      alert("리뷰가 삭제되었습니다.");
      fetchReviews();
    } catch (error) {
      console.error("리뷰 삭제 중 오류 발생:", error);
      alert(`리뷰 삭제에 실패했습니다: ${error.response?.data || error.message}`);
    }
  };

  const handleUpdateReview = async (reviewNo) => {
    if (!editingReviewText.trim()) {
      alert("수정할 내용을 입력해주세요.");
      return;
    }
    try {
      const updatedReviewData = {
        commentA: editingReviewText,
      };
      await axios.put(`http://localhost:9999/api/movie/review/${reviewNo}`, updatedReviewData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      alert("리뷰가 성공적으로 수정되었습니다.");
      setEditingReviewId(null);
      setEditingReviewText("");
      fetchReviews();
    } catch (error) {
      console.error("리뷰 수정 중 오류 발생:", error);
      alert(`리뷰 수정에 실패했습니다: ${error.response?.data || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="detail-loading-container">
        <div className="loading-spinner"></div>
        <p>영화 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="detail-loading-container">
        영화 정보를 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="movie-detail-page">
      <div className="top-blank-temp"></div>
      <div className="detail-container">
        <div className="info-section">
          <div className="poster-container">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="poster"
            />
          </div>
          <div className="text-info">
            <h1>{movie.title}</h1>
            <p>개봉일: {movie.release_date}</p>
            <p>인기도: {movie.vote_average}</p>
            <h3>개요:</h3>
            <p>{movie.overview}</p>
          </div>
        </div>

        <div className="content-sections-container">
          {movie.trailer_key && (
            <div className="trailer-section">
              <h3>예고편</h3>
              <div className="trailer-video-container">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${movie.trailer_key}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="review-section">
            <button onClick={toggleReview} className="review-toggle-button">
              리뷰 <span className="toggle-icon">{isReviewOpen ? "▲" : "▼"}</span>
            </button>
            {isReviewOpen && (
              <div className="review-content-container">
                <div className="review-input-box">
                  <textarea
                    placeholder="리뷰를 작성하세요. . . . . ."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  ></textarea>
                  <div className="input-buttons">
                    <label htmlFor="photo-upload" className="photo-upload-label">
                      사진
                    </label>
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="미리보기"
                        className="photo-preview-thumbnail"
                      />
                    )}
                    <button onClick={handleReviewSubmit} className="review-submit-button">
                      등록
                    </button>
                  </div>
                </div>
                <div className="review-list">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.reviewNo} className="review-item">
                        {editingReviewId === review.reviewNo ? (
                          <div className="review-edit-box">
                            <textarea
                              value={editingReviewText}
                              onChange={(e) => setEditingReviewText(e.target.value)}
                              className="edit-textarea"
                            ></textarea>
                            <div className="review-actions">
                              <button
                                className="complete-button"
                                onClick={() => handleUpdateReview(review.reviewNo)}
                              >
                                수정 완료
                              </button>
                              <button
                                className="cancel-button"
                                onClick={() => setEditingReviewId(null)}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="review-commentA">{review.commentA}</p>
                            <div className="review-meta">
                              {isLoggedIn && user?.userno === review.userNo && (
                                <div className="review-actions">
                                  <button
                                    className="edit-button"
                                    onClick={() => {
                                      setEditingReviewId(review.reviewNo);
                                      setEditingReviewText(review.commentA);
                                    }}
                                  >
                                    수정
                                  </button>
                                  <button
                                    className="delete-button"
                                    onClick={() => handleDeleteReview(review.reviewNo)}
                                  >
                                    삭제
                                  </button>
                                </div>
                              )}
                              <span className="user-info">작성자: {review.username}</span>
                              <span className="date">작성일: {review.createDat}</span>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="no-reviews">아직 작성된 리뷰가 없습니다.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}