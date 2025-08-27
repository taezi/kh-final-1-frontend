import axios from "axios";

const API_URL = "http://localhost:9999/api/editor/";

export const editorAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

editorAPI.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken"); // 또는 zustand에서 가져오기
    console.log(accessToken);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//게시글 작성 함수
export const createPost = async(postData) =>{
  console.log("전송 데이터:", postData) 
  try {
    const response = await editorAPI.post('/posts', postData);
    console.log("응답:", response);
    return response.data;
  } catch (error) {
    console.error("글 작성 에러:", error);
    throw error;
  }

};

// 게시글 상세 조회
export const getPostDetail = async (editorno) => {
  try {
    const response = await editorAPI.get(`/detail/${editorno}`);
    return response.data;
  } catch (error) {
    console.error("상세 조회 에러:", error);
    throw error;
  }
};

// 게시글 수정
export const updatePost = async (editorno, postData) => {
  try {
    const response = await editorAPI.put(`/update/${editorno}`, postData);
    return response.data;
  } catch (error) {
    console.error("수정 에러:", error);
    throw error;
  }
};

// 게시글 삭제
export const deletePost = async (editorno) => {
  try {
    const response = await editorAPI.delete(`/delete/${editorno}`);
    return response.data;
  } catch (error) {
    console.error("삭제 에러:", error);
    throw error;
  }
};
