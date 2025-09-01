import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL = "http://localhost:9999/api/auth/";

export const authAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(authAPI);

// 회원가입 함수
export const signup = async (username, userid, password, nickname, email) => {
  try {
    const response = await authAPI.post("signup", {
      username,
      userid,
      password,
      nickname,
      email,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    throw error;
  }
};
