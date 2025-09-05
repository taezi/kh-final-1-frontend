import axios from "axios";
import setupInterceptors from "./interceptor";

const VIEW_URL = "http://localhost:9999/api/views/";

export const viewAPI = axios.create({
  baseURL: VIEW_URL,
  withCredentials: true,
});

setupInterceptors(viewAPI);


// 에디터 조회수 증가
export const incrementEditorView = async (editorno) => {
  await viewAPI.put(`/editor/${editorno}`);
};

// 공지사항 조회수 증가
export const incrementNoticeView = async (noticeno) => {
  await viewAPI.put(`/notice/${noticeno}`);
};