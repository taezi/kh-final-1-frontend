import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../css/MovieDetailPage.css';

const TMDB_API_KEY = "674c3b16235176789e8ad2f9fee1a760"; 

// 영화 상세 정보를 TMDB API에서 가져오는 함수
const fetchMovieDetail = async (movieId) => {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ko-KR`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("영화 상세 정보 API 응답:", data);
        
        // TMDB에서 예고편 키를 가져오는 별도 호출
        const trailerUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`;
        const trailerResponse = await fetch(trailerUrl);
        const trailerData = await trailerResponse.json();
        
        const youtubeTrailer = trailerData.results.find(
            (video) => video.site === "YouTube" && video.type === "Trailer"
        );
        
        // TMDB 응답을 기반으로 필요한 데이터만 반환
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
    // URL에서 movie ID를 가져옴
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    // --- 추가된 state ---
    const [reviewText, setReviewText] = useState('');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('https://placehold.co/50x50/ADD8E6/000000?text=👤'); // 기본 아바타 이미지
    // --- 추가된 state 끝 ---

    useEffect(() => {
        const getMovieDetail = async () => {
            setLoading(true);
            const data = await fetchMovieDetail(id);
            if (data) {
                setMovie(data);
            }
            setLoading(false);
        };
        if (id) {
            getMovieDetail();
        }
    }, [id]);

    const toggleReview = () => {
        setIsReviewOpen(!isReviewOpen);
    };

    // --- 파일 업로드 처리 함수 ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file)); // 미리보기 URL 생성
        }
    };

    const handleReviewSubmit = () => {
        // TODO: 여기서 리뷰 텍스트(reviewText)와 사진(photo)을 서버로 전송하는 로직을 구현해야
        // 현재는 콘솔에 출력만
        console.log("리뷰 제출:", { text: reviewText, photo: photo });

        // 제출 후 상태 초기화
        setReviewText('');
        setPhoto(null);
        setPhotoPreview('https://placehold.co/50x50/ADD8E6/000000?text=👤');
    };
    // --- 파일 업로드 처리 함수 끝 ---

    if (loading) {
        return (
            <div className="detail-loading-container">
                <div className="loading-spinner"></div>
                <p>영화 정보를 불러오는 중...</p>
            </div>
        );
    }

    if (!movie) {
        return <div className="detail-loading-container">영화 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="movie-detail-page">
            <div className="top-blank-temp"></div>
            <div className="detail-container">
                {/* 예고편 섹션을 info-section 밖으로 이동하여 레이아웃 분리 */}
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

                {/* 예고편 섹션을 별도의 div로 분리 */}
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
                        리뷰 <span className="toggle-icon">{isReviewOpen ? '▲' : '▼'}</span>
                    </button>
                    {isReviewOpen && (
                        <div className="review-content-container">
                            <div className="review-input-box">
                                <textarea
                                    placeholder="리뷰를 작성하세요. . . . . ."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                ></textarea>
                                <label htmlFor="photo-upload" className="photo-upload-label">
                                    사진
                                </label>
                                <input
                                    type="file"
                                    id="photo-upload"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />                                
                                <button onClick={handleReviewSubmit} className="review-submit-button">등록</button>
                            </div>
                            <div className="review-list">
                                {/* 예시 리뷰들 */}
                                <div className="review-item">
                                    <div className="review-header">
                                        <span className="user-info">부모님이랑 같이 보다가 그래서 셋이 잘 안만난다고 200시간 했어요</span>
                                        <span className="date">dtfm - 2025.08.13</span>
                                    </div>
                                    <img src="사진이 업로드 되었을 경우 사진이 뜨게 하고 싶음" className="?"/>
                                </div>
                                <div className="review-item">
                                    <div className="review-header">
                                        <span className="user-info">보면서도 이런다고?? 했는데, 감독이 한국 사람이네요. 배우랑 동행 사인한 느낌</span>
                                        <span className="date">omo5 - 2025.08.10</span>
                                    </div>
                                    <img src="사진이 업로드 되었을 경우 사진이 뜨게 하고 싶음" className="?"/>
                                </div>
                                {/* 실제로는 API에서 리뷰 목록을 가져와서 map() 함수로 렌더링해야 */}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
