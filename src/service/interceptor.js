import axios from "axios";

const setupInterceptors = (apiInstance) => {
  // 요청 인터셉터
  apiInstance.interceptors.request.use(
    (config) => {
      const accessToken = localStorage.getItem("accessToken");

      //  refresh 요청에는 Authorization 헤더를 붙이지 않음
      if (accessToken && !config.url.includes("refresh")) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터 (401 처리)
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      // refresh 요청 자체가 실패했으면 그냥 에러 리턴
      if (originalRequest.url.includes("refresh")) {
        console.log("refresh 요청 자체가 실패했으면 그냥 에러 리턴");
        return Promise.reject(error);
      }
      console.log(error.response?.status);

      // Access Token 만료 → refresh로 새 토큰 발급
      if (error.response?.status === 401 && !originalRequest._retry) {
        console.log("refresh로 새 토큰 발급 시도");
        originalRequest._retry = true;
        try {
          //  refresh 요청 (쿠키 기반, Authorization 헤더 필요 없음)
          // const refreshResponse = await apiInstance.post("refresh", {});
          const refreshResponse = await axios.post(
            "http://localhost:9999/api/auth/refresh",
            {},
            { withCredentials: true }
          );

          console.log("refreshResponse : ", refreshResponse);
          const newAccessToken = refreshResponse.data.accessToken;
          console.log("newAccessToken : ", newAccessToken);

          // 새 토큰 저장
          localStorage.setItem("accessToken", newAccessToken);

          // 실패했던 요청 다시 실행
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiInstance(originalRequest);
        } catch (refreshError) {
          // Refresh Token도 만료 → 로그인 페이지로 이동
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;
