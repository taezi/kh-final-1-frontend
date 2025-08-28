import axios from "axios";

const AI_URL = "http://localhost:9999/api/manage/";

export const manageAPI = axios.create({
  baseURL: AI_URL,
  withCredentials: true,
});

manageAPI.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    console.log("토큰:", localStorage.getItem("accessToken"));
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
