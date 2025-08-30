import axios from "axios";

// API 기본 URL 설정
const API_URL = "http://localhost:9999/api/manage";

// axios 인스턴스 생성
export const manageAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 요청 인터셉터 설정 (토큰 자동 포함)
manageAPI.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 accessToken을 가져옵니다.
    const accessToken = localStorage.getItem("accessToken");
    console.log("토큰:", accessToken);
    if (accessToken) {
      // 헤더에 Authorization 토큰을 추가합니다.
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 새로운 문의를 등록하는 함수
 * @param {object} inquiryData - 등록할 문의 데이터 (이름, 전화번호, 제목, 내용, userno 등)
 * @returns {Promise<object>} - 서버 응답 데이터
 */
export const createInquiry = async (inquiryData) => {
  console.log("전송 데이터:", inquiryData);
  try {
    // POST 요청을 보냅니다.
    const response = await manageAPI.post("/inquiry/submit", inquiryData);
    console.log("서버 응답:", response);
    return response.data;
  } catch (error) {
    console.error("문의 등록 에러:", error);
    throw error;
  }
};

// 필요한 경우, 문의 목록 조회, 수정, 삭제 등의 함수를 여기에 추가할 수 있습니다.
// 예시:
// export const getInquiries = async () => {
//   try {
//     const response = await manageAPI.get("/list");
//     return response.data;
//   } catch (error) {
//     console.error("문의 목록 조회 에러:", error);
//     throw error;
//   }
// };
