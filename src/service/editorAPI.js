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



//editorWritePage
export const createPost = async(postData) =>{

  console.log(postData)
      // await 사용해서 Axios 요청
    
  try {
    const response = await editorAPI.post('/posts', postData);
    console.log(response);
    return response.data;
  } catch (error) {
    throw error;
  }
};
