import axios from "axios";

const AI_URL = "http://localhost:9999/api/ai/";

export const aiAPI = axios.create({
  baseURL: AI_URL,
  withCredentials: true,
});

aiAPI.interceptors.request.use(
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

export const generateAI = async (prompt) => {
  try {
    const response = await aiAPI.get("generate", {
      params: { prompt },
    });
    return response.data;
  } catch (error) {
    console.error("AI 요청 실패:", error);
    throw error;
  }
};
