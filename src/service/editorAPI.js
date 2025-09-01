import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL = "http://localhost:9999/api/editors";

export const editorAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(editorAPI);

// 게시글 작성
export const createPost = async (postData) => {
  const response = await editorAPI.post("", postData); // POST /api/editors
  return response.data;
};

// 게시글 전체 조회 + 검색
export const getPostList = async (search= "") => {
  // GET /api/editors
  const response = await editorAPI.get("/editor", {
   params: { search },
  });
  return response.data;
};

// 게시글 상세 조회
export const getPostDetail = async (editorno) => {
  const response = await editorAPI.get(`/${editorno}`); // GET /api/editors/{id}
  return response.data;
};

// 게시글 수정
export const updatePost = async (editorno, postData) => {
  const response = await editorAPI.put(`/${editorno}`, postData); // PUT /api/editors/{id}
  return response.data;
};

// 게시글 삭제
export const deletePost = async (editorno) => {
  const response = await editorAPI.delete(`/${editorno}`); // DELETE /api/editors/{id}
  return response.data;
};

// 이미지 업로드
export const uploadImageToS3 = async (blob) => {
  const presignedRes = await editorAPI.get("/s3/presigned", {
    params: {
      filename: blob.name || `image_${Date.now()}.png`,
      contentType: blob.type || "image/png",
    },
  });

  const { uploadUrl, fileUrl } = presignedRes.data;

  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": blob.type },
    body: blob,
  });

  return fileUrl;
};
