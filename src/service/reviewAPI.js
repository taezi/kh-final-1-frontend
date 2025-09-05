import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL = "http://localhost:9999/api/reviews";

export const reviewAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(reviewAPI);

// 댓글 목록 조회
export const getComments = async (contentType, contentNo) => {
  const response = await reviewAPI.get(`/${contentType}/${contentNo}`);
  return response.data;
};

// 댓글 등록
export const addComment = async (contentType, contentNo, commentData) => {
  const response = await reviewAPI.post(`/${contentType}/${contentNo}`, commentData);
  return response.data;
};

// 댓글 수정
export const updateComment = async (reviewNo, newContent) => {
  const response = await reviewAPI.put(`/${reviewNo}`, { commenta: newContent });
  return response.data;
};

// 댓글 삭제
export const removeComment = async (reviewNo) => {
  const response = await reviewAPI.delete(`/${reviewNo}`);
  return response.data;
};
