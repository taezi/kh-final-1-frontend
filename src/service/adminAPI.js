import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL = "http://localhost:9999/api/admin";

export const adminAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(adminAPI);

export const getUserData = async () => {
  try {
    const response = await adminAPI.get("");
    return response.data;
  } catch (error) {
    console.error("사용자 목록을 불러오는 데 실패했습니다.", error);
    throw error;
  }
};

export const deleteAdminUser = async (userno) => {
  try {
    console.log("삭제 유저 번호 : ", userno);
    const response = await adminAPI.delete("", { data: userno });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// 회원 정보 수정
export const updateAdminUser = async (userno, updatedData) => {
  try {
    const response = await adminAPI.put(`/user/${userno}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`회원 ${userno} 수정 실패`, error);
    throw error;
  }
};

// 단일 회원 조회
export const getUserByNo = async (userno) => {
  try {
    const response = await adminAPI.get(`/user/${userno}`);
    return response.data;
  } catch (error) {
    console.error(`회원 ${userno} 정보를 불러오는 데 실패했습니다.`, error);
    throw error;
  }
};
