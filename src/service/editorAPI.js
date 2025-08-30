import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL = "http://localhost:9999/api/editor";

export const editorAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(editorAPI);

//게시글 작성 함수
export const createPost = async (postData) => {
  console.log("전송 데이터:", postData);
  try {
    const response = await editorAPI.post("/posts", postData);
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

// 이미지 업로드
export const uploadImageToS3 = async (blob) => {
  try {
    // 1) Presigned URL 요청 (Spring API 호출)
    const presignedRes = await editorAPI.get("/s3/presigned", {
      params: {
        filename: blob.name || `image_${Date.now()}.png`,
        contentType: blob.type || "image/png",
      },
    });

    const { uploadUrl, fileUrl } = presignedRes.data;

    // 2) Presigned URL로 파일 PUT 업로드
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": blob.type },
      body: blob,
    });

    // 3) 업로드 완료된 파일 URL 반환
    return fileUrl;
  } catch (err) {
    console.error("이미지 업로드 실패:", err);
    throw err;
  }
};
