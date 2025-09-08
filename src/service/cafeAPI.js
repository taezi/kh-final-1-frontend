// src/service/cafeAPI.js

import axios from "axios";

// 프록시 설정이 /api → http://localhost:9999 로 전달된다고 가정합니다.
// 여기서는 /api/cafe 를 API의 기본 경로로 설정합니다.
const API_BASE = "/api/cafe";

// Axios 인스턴스 생성
export const cafeAPI = axios.create({
  // axios.create: Axios의 새로운 인스턴스를 생성
  baseURL: API_BASE,
  // baseURL: 모든 요청에 대해 기본적으로 사용될 URL
  withCredentials: false,
  // withCredentials: 요청에 쿠키나 인증 헤더를 포함시킬지 여부
});

// 디버깅을 위한 요청 인터셉터
// 요청이 서버로 보내지기 전에 가로채서 로그를 출력합니다.
cafeAPI.interceptors.request.use((config) => {
  // config: 요청에 대한 설정을 담고 있는 객체
  const base = (config.baseURL || "").replace(/\/+$/, "");
  // baseURL의 마지막에 있는 슬래시를 제거
  const path = (config.url || "").replace(/^\/+/, "");
  // URL의 시작에 있는 슬래시를 제거
  const full = `${base}/${path}`;
  // 전체 URL 경로를 조합
  console.log(
    "[API]",
    config.method?.toUpperCase(),
    full,
    config.params || config.data || ""
  );
  // 콘솔에 요청 정보(메서드, 전체 URL, 파라미터/데이터)를 출력
  return { ...config, url: path, baseURL: base };
  // 다음 인터셉터나 요청으로 수정된 config 객체를 전달
});

// 디버깅을 위한 응답 인터셉터
// 응답이 클라이언트에 도달하기 전에 가로채서 에러 로그를 출력합니다.
cafeAPI.interceptors.response.use(
  (res) => res,
  // 정상적인 응답일 경우 응답 객체를 그대로 반환
  (err) => {
    // 에러가 발생한 경우 에러 객체
    const base = (err.config?.baseURL || "").replace(/\/+$/, "");
    const path = (err.config?.url || "").replace(/^\/+/, "");
    const full = `${base}/${path}`;
    // 에러 발생 시의 전체 URL을 조합
    console.error(
      "[API ERR]",
      err?.response?.status || "-",
      full,
      err?.message
    );
    // 콘솔에 에러 정보(상태 코드, URL, 에러 메시지)를 출력
    return Promise.reject(err);
    // Promise.reject를 사용하여 호출자에게 에러를 전파
  }
);

// --- API 호출 함수들 ---

/**
 * 레스토랑 번호로 레스토랑 정보를 조회하는 GET 요청
 * @param {object} params - 조회에 필요한 파라미터 객체
 * @param {number} params.cafeNo - 조회할 레스토랑 번호
 * @returns {Promise<CafeDto>} - 조회된 레스토랑 정보
 */
export const getCafeInfo = ({ cafeNo }) =>
  cafeAPI
    .get("/info", { params: { cafeNo } })
    // 백엔드의 컨트롤러(CafeController)에 맞게 파라미터 이름을 cafeNo로 변경했습니다.
    .then((r) => r.data);

/**
 * 기존 레스토랑 정보를 업데이트하는 POST 요청
 * @param {object} cafeDto - 업데이트할 정보가 담긴 CafeDto 객체
 * @returns {Promise<string>} - 업데이트 성공 메시지
 */
export const updateCafe = (cafeDto) =>
  cafeAPI
    .post("/update", cafeDto)
    .then((r) => r.data);

/**
 * 특정 지역구에 속한 레스토랑 목록을 조회하는 GET 요청
 * @param {object} params - 조회에 필요한 파라미터 객체
 * @param {string} params.gu - 조회할 지역구 이름
 * @param {string} params.q - 조회할 검색어
 * @param {number} params.page - 페이지 번호
 * @param {number} params.size - 페이지당 항목 수
 * @returns {Promise<object>} - 조회된 식당 목록과 페이징 정보
 */
export const getCafeList = ({ gu, q, page, size }) =>
  cafeAPI
    .get("/search", { params: { gu, q, page, size } })
    // 백엔드의 컨트롤러에 맞게 파라미터 이름을 `gu`와 `q`로 변경하고, `page`와 `size` 파라미터를 추가했습니다.
    .then((r) => r.data);