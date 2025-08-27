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
