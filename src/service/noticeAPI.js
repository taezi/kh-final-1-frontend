// src/service/noticeAPI.js
import axios from "axios";
import setupInterceptors from "./interceptor";

// RESTful 엔드포인트: /api/notices
const API_URL = "http://localhost:9999/api/notices";

export const noticeAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(noticeAPI);

// 공지사항 작성 (POST /api/notices)
export const createNotice = async (noticeData) => {
  console.log("전송 데이터:", noticeData);
  try {
    const response = await noticeAPI.post("", noticeData);
    return response.data;
  } catch (error) {
    console.error("공지사항 작성 에러:", error);
    throw error;
  }
};

// 공지사항 상세 조회 (GET /api/notices/{id})
export const getNoticeDetail = async (noticeno) => {
  try {
    const response = await noticeAPI.get(`/${noticeno}`);
    return response.data;
  } catch (error) {
    console.error("공지사항 상세 조회 에러:", error);
    throw error;
  }
};

// 공지사항 수정 (PUT /api/notices/{id})
export const updateNotice = async (noticeno, noticeData) => {
  try {
    const response = await noticeAPI.put(`/${noticeno}`, noticeData);
    return response.data;
  } catch (error) {
    console.error("공지사항 수정 에러:", error);
    throw error;
  }
};

// 공지사항 삭제 (DELETE /api/notices/{id})
export const deleteNotice = async (noticeno) => {
  try {
    const response = await noticeAPI.delete(`/${noticeno}`);
    return response.data;
  } catch (error) {
    console.error("공지사항 삭제 에러:", error);
    throw error;
  }
};

// 공지사항 리스트 조회 (GET /api/notices?page=1&size=10)
export const getNoticeList = async (page = 1, size = 10) => {
  try {
    const response = await noticeAPI.get(`?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error("공지사항 리스트 조회 에러:", error);
    throw error;
  }
};
