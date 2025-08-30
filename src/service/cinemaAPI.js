import axios from "axios";

// 영화관 API의 기본 URL
const CINEMA_URL = "/api/cinemas";

// 영화관 데이터를 가져오는 함수
export const fetchCinemas = async (region) => {
  try {
    const response = await axios.get(CINEMA_URL, {
      params: { region }, // 쿼리 파라미터로 지역을 전달
    });
    return response.data; // 영화관 데이터 반환
  } catch (error) {
    console.error(`영화관 데이터 로딩 실패: ${region}에 대한 에러`, error);
    // 에러 발생 시 빈 배열을 반환하여 상위 컴포넌트에서 안전하게 처리할 수 있도록
    return [];
  }
};
