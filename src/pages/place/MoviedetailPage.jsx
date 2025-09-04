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

  // Zustand 스토어에서 로그인 상태와 유저 정보 가져오기
  const { user, accessToken } = useAuthStore(); // accessToken 추가
  const isLoggedIn = !!user; // user 객체가 존재하면 true

  const fetchReviews = async () => {
    try {
      const headers = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const config = accessToken ? { headers } : {};

      const response = await axios.get(`http://localhost:9999/api/movie/review/${id}`, config);
      setReviews(response.data);
    } catch (error) {
      console.error("리뷰를 불러오는 중 오류가 발생했습니다:", error);
    }
  };


//  영화 상세 정보/리뷰 불러오는 useEffect
  useEffect(() => {
    const getMovieDetail = async () => {
      setLoading(true);
      const movieData = await fetchMovieDetail(id);
      if (movieData) {
        setMovie(movieData);
        fetchReviews();
      }
      setLoading(false);
    };
    if (id) {
      getMovieDetail();
    }
  }, [id, accessToken]);

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
    // 1. 로그인 상태 확인 (이제 useAuthStore의 user 상태를 사용)
    if (!isLoggedIn) {
      alert("로그인해야 리뷰를 등록하실 수 있습니다.");
      return;
    }

    if (!reviewText.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    console.log("JWT 토큰:", accessToken);

    // 2. 로그인된 사용자의 userNo를 사용
    const reviewData = {
      userNo: user.userNo,
      comment: reviewText,
      contentType: "movie",
      contentNo: parseInt(id),
    };

    try {
      await axios.post("http://localhost:9999/api/movie/review", reviewData, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // JWT 토큰 추가
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
                  <button
                    onClick={handleReviewSubmit}
                    className="review-submit-button"
                  >
                    등록
                  </button>
                </div>
              </div>
              <div className="review-list">
                               {" "}
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.reviewNo} className="review-item">
                                           {" "}
                      <div className="review-header">
                                               {" "}
                        <span className="user-info">
                          작성자: {review.userNo}
                        </span>
                                               {" "}
                        <span className="date">작성일: {review.createDat}</span>
                                             {" "}
                      </div>
                                           {" "}
                      <p className="review-comment">{review.comment}</p>       
                                 {" "}
                    </div>
                  ))
                ) : (
                  <p className="no-reviews">아직 작성된 리뷰가 없습니다.</p>
                )}
                             {" "}
              </div>
            </div>
          )}
        </div>

        </div>


      </div>

    </div>
  );
}
