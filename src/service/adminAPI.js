
import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL = "http://localhost:9999/api/admin/";

export const adminAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(adminAPI);


export const fetchUsers = async () => {
  try {
    const response = await adminAPI.get("users");
    return response.data; 
  } catch (error) {
    console.error("사용자 목록을 불러오는 데 실패했습니다.", error);
    throw error; 
  }
};
