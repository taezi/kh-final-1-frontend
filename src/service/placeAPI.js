import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL = "http://localhost:9999/api/place/";

/** 프록시 기준 상대경로(baseURL) — 절대 URL 쓰지 않음 */
const placeAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(placeAPI);
// (선택) 디버깅 로그
// placeAPI.interceptors.request.use((config) => {
//   const full = `${(config.baseURL || "").replace(/\/+$/, "")}/${(
//     config.url || ""
//   ).replace(/^\/+/, "")}`;
//   console.log(
//     "[API]",
//     config.method?.toUpperCase(),
//     full,
//     config.params || config.data || ""
//   );
//   return config;
// });
// placeAPI.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const full = `${(err.config?.baseURL || "").replace(/\/+$/, "")}/${(
//       err.config?.url || ""
//     ).replace(/^\/+/, "")}`;
//     console.error(
//       "[API ERR]",
//       err?.response?.status || "-",
//       full,
//       err?.message
//     );
//     return Promise.reject(err);
//   }
// );

/** ---------- DB(row) → UI 공통 스키마로 변환 ---------- */
function mapDbRowToUi(ev = {}) {
  return {
    id: ev.cultureNo, // CULUTENO
    title: ev.cultureName, // CULUTENAME
    gu: ev.district, // DISTRICT
    place: ev.organizationName || ev.cultureAddress || "",
    address: ev.cultureAddress || "",
    thumbUrl: ev.thumbnailImage || "",
    website: ev.portalUrl || "",
    feeText: ev.fee || ev.isFree || "", // '무료'/'유료' 등 텍스트
    dateStart: ev.startDate, // YYYY-MM-DD(LocalDate)
    dateEnd: ev.endDate, // YYYY-MM-DD(LocalDate)
    time: ev.time || "", // DB에 없으니 빈값
    // 원본 유지(상세/디버깅용)
    _raw: ev,
  };
}
function mapListPayload(data) {
  return {
    ...data,
    items: Array.isArray(data?.items) ? data.items.map(mapDbRowToUi) : [],
  };
}

/** 주의: URL 앞에 슬래시(/) 붙이지 않기 (baseURL과 중복 방지) */
export const getEventList = ({ date, gu = "", q = "", page = 1, size = 12 }) =>
  placeAPI
    .get("events/list", { params: { date, gu, q, page, size } })
    .then((r) => mapListPayload(r.data));

export const getCalendar = ({ month, gu = "", q = "" }) =>
  placeAPI
    .get("events/calendar", { params: { month, gu, q } })
    .then((r) => r.data);

export const getFeatured = ({ gu = "", from, to, limit = 4 }) =>
  placeAPI
    .get("events/featured", { params: { gu, from, to, limit } })
    .then((r) => (Array.isArray(r.data) ? r.data.map(mapDbRowToUi) : []));

/** 상세 API가 준비되면 이 스키마로 내려오게 맞춰줌 */
export const getEventDetail = ({ id }) =>
  placeAPI
    .get(`events/${encodeURIComponent(id)}`)
    .then((r) => mapDbRowToUi(r.data));
