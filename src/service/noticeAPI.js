// src/service/noticeAPI.js
import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL = "http://localhost:9999/api/notice";

export const noticeAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(noticeAPI);

// 공지사항 작성
export const createNotice = async (noticeData) => {
  console.log("전송 데이터:", noticeData);
  try {
    const response = await noticeAPI.post("/write", noticeData);
    return response.data;
  } catch (error) {
    console.error("공지사항 작성 에러:", error);
    throw error;
  }
};

// 공지사항 상세 조회
export const getNoticeDetail = async (noticeno) => {
  try {
    const response = await noticeAPI.get(`/detail/${noticeno}`);
    return response.data;
  } catch (error) {
    console.error("공지사항 상세 조회 에러:", error);
    throw error;
  }
};

// 공지사항 수정
export const updateNotice = async (noticeno, noticeData) => {
  try {
    const response = await noticeAPI.put(`/update/${noticeno}`, noticeData);
    return response.data;
  } catch (error) {
    console.error("공지사항 수정 에러:", error);
    throw error;
  }
};

// 공지사항 삭제
export const deleteNotice = async (noticeno) => {
  try {
    const response = await noticeAPI.delete(`/delete/${noticeno}`);
    return response.data;
  } catch (error) {
    console.error("공지사항 삭제 에러:", error);
    throw error;
  }
};

// 공지사항 리스트 조회
export const getNoticeList = async (page = 1) => {
  try {
    const response = await noticeAPI.get(`/list?page=${page}`);
    return response.data;
  } catch (error) {
    console.error("공지사항 리스트 조회 에러:", error);
    throw error;
  }
};
