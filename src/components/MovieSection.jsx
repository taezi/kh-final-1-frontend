import React, { useRef } from "react";
import { useNavigate } from 'react-router-dom'; // useNavigate 훅 import
import "../css/MovieSection.css";

export default function MovieSection({ movies }) {
  const scroller = useRef(null);
  const navigate = useNavigate(); // useNavigate 훅 사용

  // 다음 캐러셀 페이지로 이동하는 함수
  const goToNext = () => {
    scroller.current?.scrollBy({ left: 360, behavior: "smooth" });
  };

  // 이전 캐러셀 페이지로 이동하는 함수
  const goToPrevious = () => {
    scroller.current?.scrollBy({ left: -360, behavior: "smooth" });
  };

  // 영화 포스터 클릭 시 상세 페이지로 이동
  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (!movies || movies.length === 0) {
    return (
      <div className="movie-section">
        <div className="empty-message">영화 데이터를 불러오는 중이거나, 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="movie-section">
      <h2 className="section-title">상영 중인 영화</h2>
      <div className="carousel-head">
        {/* 이전 버튼 */}
        <button onClick={goToPrevious} className="arrow" aria-label="이전 영화">
          ‹
        </button>

        {/* 캐러셀 목록 */}
        <div className="carousel" ref={scroller} role="list">
          {movies.map((movie) => (
            <article 
              key={movie.id} 
              className="car-card" 
              role="listitem"
              onClick={() => handleMovieClick(movie.id)} // 클릭 이벤트 추가
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="thumb"
              />
              <div className="title">{movie.title}</div>
            </article>
          ))}
        </div>

        {/* 다음 버튼 */}
        <button onClick={goToNext} className="arrow" aria-label="다음 영화">
          ›
        </button>
      </div>
    </div>
  );
}