import axios from "axios";

// 여기에 TMDB API 키를 입력하세요.
const TMDB_API_KEY = "674c3b16235176789e8ad2f9fee1a760"; 
const TMDB_URL = "https://api.themoviedb.org/3/movie/";

const movieAPI = axios.create({
  baseURL: TMDB_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: "ko-KR", // 한국어 설정
  },
});

/**
 * 상영 중인 영화 데이터를 TMDB API에서 가져오는 함수
 * @returns {Promise<Array>} 영화 데이터 배열
 */
export const fetchMoviesNowPlaying = async () => {
  try {
    const response = await movieAPI.get("now_playing");
    // TMDB API는 응답 데이터를 JSON으로 반환하며, 'results' 키에 영화 배열이 들어있습니다.
    return response.data.results;
  } catch (error) {
    console.error("영화 데이터를 불러오는 데 실패했습니다:", error);
    throw error;
  }
};

export default movieAPI;