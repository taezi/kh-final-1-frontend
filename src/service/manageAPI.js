import axios from "axios";
import setupInterceptors from "./interceptor";

// API 기본 URL 설정
const API_URL = "http://localhost:9999/api/manage";

// axios 인스턴스 생성
export const manageAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(manageAPI);

// 아이디 찾기
export const findIdByUserInfo = async (username, nickname) => {
  const { data } = await manageAPI.get("/find-id", {
    params: { username, nickname },
  });
  return data; // { foundId: "..." } 반환
};
// 비번찾기 return data
export const findPassword = async ({ name, userid, nickname }) => {
  const { data } = await manageAPI.post("/find-pwd", {
    username: name, // 백엔드 파라미터명에 맞춤
    userid,
    nickname,
  });
  return data; // { tempPassword: "..." } 또는 { tempPassword: null }
};

// 문의 등록
export const createInquiry = async (inquiryData) => {
  console.log("전송 데이터:", inquiryData);
  try {
    const response = await manageAPI.post("/inquiry", inquiryData);
    console.log("서버 응답:", response);
    return response.data;
  } catch (error) {
    console.error("문의 등록 에러:", error);
    throw error;
  }
};

export const getInquiries = async (userno) => {
  try {
    const response = await manageAPI.get(`/inquiry/list/${userno}`);
    return response.data;
  } catch (error) {
    console.error("문의 목록 조회 에러:", error);
    throw error;
  }
};

export const getInquiryDetail = async (inquiryno) => {
  try {
    console.log("문의글 번호 : ", inquiryno);
    const response = await manageAPI.get(`/inquiry/detail/${inquiryno}`);
    console.log("문의 상세 정보:", response.data);
    return response.data;
  } catch (error) {
    console.error("문의 상세 정보 조회 에러:", error);
    throw error;
  }
};

export const deleteUser = async (data) => {
  console.log("회원 탈퇴 데이터 : ", data);
  try {
    const response = await manageAPI.delete("", { data });

    return response.data;
  } catch (error) {
    console.log("회원 탈퇴 에러 : ", error);
    throw error;
  }
};

export const updateUserid = async (before, after) => {
  try {
    console.log("before, after : ", before, after);
    const response = await manageAPI.put("/userid", { before, after });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateUsername = async (userid, after) => {
  try {
    console.log("userid, after : ", userid, after);
    const response = await manageAPI.put("/username", { userid, after });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const updateNickname = async (userid, after) => {
  try {
    console.log("userid, after : ", userid, after);
    const response = await manageAPI.put("/nickname", { userid, after });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const updateEmail = async (userid, after) => {
  try {
    console.log("userid, after : ", userid, after);
    const response = await manageAPI.put("/email", { userid, after });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const updatePassword = async (userid, before, after) => {
  try {
    console.log("userid, before, after : ", userid, before, after);
    const response = await manageAPI.put("/password", {
      userid,
      before,
      after,
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllInquiries = async () => {
  try {
    const response = await manageAPI.get("/inquiry/list");
    console.log("모든1:1문의내역 : ", response.data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const createInquiryReply = async (replyData) => {
  try {
    console.log("전송 데이터(답변) :", replyData);
    const response = await manageAPI.post("/inquiry/reply", replyData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
