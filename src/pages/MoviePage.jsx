import React, { useEffect, useState } from "react";
import MovieSection from "../components/MovieSection";
import CinemaSection from "../components/CinemaSection";
import "../css/MoviePage.css";
import { fetchMoviesNowPlaying } from "../service/movieAPI";
import { fetchCinemas } from "../service/cinemaAPI";

export default function MoviePage() {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  // 서울 25개 구 전체 목록을 직접 정의합니다.
  const allRegions = ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'];
  // 초기값을 '강남구'로 설정하여 처음 로딩 시 강남구 데이터가 표시되도록 합니다.
  const [selectedRegion, setSelectedRegion] = useState('강남구');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 영화 데이터 가져오기
  useEffect(() => {
    const getMovies = async () => {
      try {
        const data = await fetchMoviesNowPlaying();
        setMovies(data);
      } catch (err) {
        setError("영화 데이터를 불러오는 데 실패했습니다.");
        console.error("영화 API 에러:", err);
      }
    };
    getMovies();
  }, []);

  // 상영관 데이터 가져오기 (selectedRegion이 변경될 때마다 호출)
  useEffect(() => {
    const getCinemas = async () => {
      if (!selectedRegion) return;
      setLoading(true);
      try {
        // 선택된 지역구의 데이터만 가져옵니다.
        const data = await fetchCinemas(selectedRegion);
        setCinemas(data);
      } catch (err) {
        setError("상영관 데이터를 불러오는 데 실패했습니다.");
        console.error("상영관 API 에러:", err);
      } finally {
        setLoading(false);
      }
    };
    getCinemas();
  }, [selectedRegion]);

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
  };

  // 다음 슬라이드로 이동하는 함수
  const nextSlide = () => {
    if (movies.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }
  };

  // 이전 슬라이드로 이동하는 함수
  const prevSlide = () => {
    if (movies.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length);
    }
  };

  if (error) {
    return (
      <>
        <div className="top-blank-temp"></div>
        <div className="error-message">{error}</div>
      </>
    );
  }

  const currentBannerImage = movies.length > 0
    ? `https://image.tmdb.org/t/p/original${movies[currentSlide].backdrop_path}`
    : "";

  return (
    <>
      <div className="top-blank-temp"></div>
      
      <div className="movie-page-content">
        <div className="hero-band">
          <div
            className="hero"
            style={{ backgroundImage: `url(${currentBannerImage})` }}
          >
            <button onClick={prevSlide} className="hero-arrow left">
              {"<"}
            </button>
            <button onClick={nextSlide} className="hero-arrow right">
              {">"}
            </button>
          </div>
        </div>

        <MovieSection movies={movies} />
        
        <CinemaSection
          // 모든 지역구 목록을 prop으로 전달
          allRegions={allRegions} 
          cinemas={cinemas}
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
        />
      </div>
    </>
  );
}
