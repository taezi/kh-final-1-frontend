// src/service/placeAPI.js
import axios from "axios";

// 프록시가 /api → http://localhost:9999 로 전달.
// 여기서는 /api/place 를 base 로 두고 상대경로만 호출.
const API_BASE = "/api/place";

export const placeAPI = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// 디버깅 로그: 실제로 나가는 URL 확인
placeAPI.interceptors.request.use((config) => {
  const base = (config.baseURL || "").replace(/\/+$/, "");
  const path = (config.url || "").replace(/^\/+/, "");
  const full = `${base}/${path}`;
  console.log(
    "[API]",
    config.method?.toUpperCase(),
    full,
    config.params || config.data || ""
  );
  return { ...config, url: path, baseURL: base };
});

placeAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    const base = (err.config?.baseURL || "").replace(/\/+$/, "");
    const path = (err.config?.url || "").replace(/^\/+/, "");
    const full = `${base}/${path}`;
    console.error(
      "[API ERR]",
      err?.response?.status || "-",
      full,
      err?.message
    );
    return Promise.reject(err);
  }
);

// 앞에 슬래시( / ) 붙이지 말 것! (interceptor가 합쳐줌)
export const getFeatured = ({ gu = "", from, to, limit = 4 }) =>
  placeAPI
    .get("events/featured", { params: { gu, from, to, limit } })
    .then((r) => r.data);

export const getCalendar = ({ month, gu = "", q = "" }) =>
  placeAPI
    .get("events/calendar", { params: { month, gu, q } })
    .then((r) => r.data);

export const getEventList = ({ date, gu = "", q = "", page = 1, size = 12 }) =>
  placeAPI
    .get("events/list", { params: { date, gu, q, page, size } })
    .then((r) => r.data);

// src/service/placeAPI.js (맨 아래 추가)
export const getEventDetail = ({ id }) =>
  placeAPI.get(`events/${encodeURIComponent(id)}`).then((r) => r.data);
