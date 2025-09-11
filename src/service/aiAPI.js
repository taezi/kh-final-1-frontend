import axios from "axios";
import setupInterceptors from "./interceptor";

const AI_URL = "http://localhost:9999/api/ai/";

export const aiAPI = axios.create({
  baseURL: AI_URL,
  withCredentials: true,
});

setupInterceptors(aiAPI);

export const generateAI = async (prompt) => {
  try {
    const response = await aiAPI.post("generate", {
      prompt: prompt,
    });
    console.log("ai 대답 : ", response.data);
    return response.data;
  } catch (error) {
    console.error("AI 요청 실패:", error);
    throw error;
  }
};
