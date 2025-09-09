// src/service/mapAPI.js
import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api/maps"
    : "http://localhost:9999/api/maps";

export const mapAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(mapAPI);

// 문자열 응답도 안전하게 JSON 파싱 (```json … ``` 제거 포함)
const tryParseJSON = (val) => {
  if (typeof val !== "string") return val;
  try {
    const stripped = val
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    return JSON.parse(stripped);
  } catch {
    return val; // 파싱 실패 시 원문 그대로 반환
  }
};

/**
 * 주소 배열로 Directions 임베드 URL 받기
 * 성공 시 { url: "https://www.google.com/..." } 형태로 반환
 */
export async function fetchDirectionsUrl(addresses = []) {
  try {
    const res = await mapAPI.post("/directions-url", { addresses });
    console.log("리스폰스 : ", res);
    console.log("리스폰스 : ", res.data);
    let data = tryParseJSON(res?.data);

    // 가능한 응답 형태를 모두 수용
    const url =
      data?.url || data?.data?.url || (typeof data === "string" ? data : "");

    if (!url || typeof url !== "string") {
      throw new Error("유효한 URL이 응답에 없습니다.");
    }
    return { url };
  } catch (err) {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err.message || "요청 실패";
    throw new Error(
      `Directions URL 요청 실패${status ? ` (${status})` : ""}: ${msg}`
    );
  }
}
