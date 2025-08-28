// src/service/noticeAPI.js
import axios from "axios";

const API_URL = "http://localhost:9999/api/notice";

export const noticeAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 요청 인터셉터 → 토큰 넣기
noticeAPI.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken"); // 또는 zustand 사용
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
