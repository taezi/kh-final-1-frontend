import axios from "axios";

const API_URL = "http://localhost:9999/api/auth/";

export const authAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

authAPI.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken"); // 또는 zustand에서 가져오기
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refresh 요청 (백엔드에 맞게 엔드포인트 조정)
        const refreshResponse = await authAPI.post("refresh");
        const newAccessToken = refreshResponse.data.accessToken;

        // 저장소 갱신 (zustand 또는 localStorage)
        localStorage.setItem("accessToken", newAccessToken);

        // 원래 요청 다시 시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return authAPI(originalRequest);
      } catch (refreshError) {
        console.error("리프레시 토큰 만료 → 로그아웃 필요");
        localStorage.removeItem("accessToken");
        // 필요하다면: window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// 회원가입 함수
export const signup = async (username, userid, password, nickname, email) => {
  try {
    const response = await authAPI.post("signup", {
      username,
      userid,
      password,
      nickname,
      email,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    throw error;
  }
};
