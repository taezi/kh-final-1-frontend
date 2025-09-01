const setupInterceptors = (apiInstance) => {
  // 요청 인터셉터
  apiInstance.interceptors.request.use(
    (config) => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
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

      if (originalRequest.url.includes("refresh")) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await apiInstance.post("refresh");
          const newAccessToken = refreshResponse.data.accessToken;

          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiInstance(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
  );
};

export default setupInterceptors;
