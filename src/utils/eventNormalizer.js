// src/utils/eventNormalizer.js

/** 공백/빈문자/문자열 'null' 정리 + 앞뒤 trim */
function normStr(v) {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (!t) return undefined;
  if (t.toLowerCase() === "null") return undefined;
  return t;
}

/** 객체 깊은 정리: 문자열 정리, 빈 문자열 제거 */
export function sanitizeDeep(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeDeep);
  if (typeof obj !== "object") return normStr(obj);

  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const vv = sanitizeDeep(v);
    if (vv === "" || vv === undefined) continue;
    out[k] = vv;
  }
  return out;
}

/** 안전한 선택: next가 의미 있을 때만 채택 */
function pick(next, prev) {
  if (next === null || next === undefined) return prev;
  if (typeof next === "string") return next.trim() ? next : prev;
  if (Array.isArray(next)) return next.length ? next : prev;
  return next;
}

/** 요금 텍스트 표준화 */
function makeFeeText(src) {
  const cand = [
    src.feeText, // 이미 표준화된 경우
    src.fee, // ✅ 백엔드 EventDto (camelCase)
    src.isFree, // ✅ 백엔드 EventDto (Y/N)
    src._csv?.fee,
    src._csv?.isfree,
    src._raw?.fee,
    src._raw?.charge,
    src._raw?.price,
  ]
    .map(normStr)
    .filter(Boolean);

  if (cand.length === 0) return "";

  // isFree가 'Y'면 무료 처리
  const hasYesFree = cand.includes("Y") || cand.includes("y");
  const f0 = cand[0];
  const low = f0.toLowerCase();
  if (
    hasYesFree ||
    ["yes", "free", "무료", "0", "0원"].some((kw) => low.includes(kw))
  ) {
    return "무료";
  }
  return f0;
}

/** 시간/운영시간 표준화 */
function makeTimeText(src) {
  return (
    normStr(src.timeText) ||
    normStr(src.time) || // 일반 키
    normStr(src._csv?.time) ||
    normStr(src._raw?.time) ||
    ""
  );
}

function makeOpenHours(src) {
  return (
    normStr(src.openHours) ||
    normStr(src.openhours) || // 변형 대응
    normStr(src._csv?.openhours) ||
    normStr(src._raw?.openhours) ||
    ""
  );
}

/** 설명 필드 표준화 (HTML/텍스트 분리) */
function makeDescriptions(src) {
  const descriptionHtml =
    normStr(src.descriptionHtml) ||
    normStr(src._csv?.descriptionhtml) ||
    normStr(src._raw?.descriptionhtml) ||
    "";

  const summary =
    normStr(src.summary) ||
    normStr(src._csv?.summary) ||
    normStr(src._raw?.summary) ||
    "";

  const description =
    normStr(src.description) || // ✅ 백엔드 EventDto
    normStr(src._csv?.description) ||
    normStr(src._raw?.description) ||
    normStr(src._raw?.overview) ||
    normStr(src._raw?.content) ||
    "";

  return { descriptionHtml, summary, description };
}

/** 원천(raw) 객체를 표준 이벤트 모델로 변환 */
export function normalizeEvent(rawInput) {
  const raw = sanitizeDeep(rawInput || {});
  const _csv = raw._csv || {};
  const _raw = raw._raw || raw;

  // ✅ 백엔드 EventDto(CamelCase) 키들을 1순위로 매핑
  const id =
    raw.id ??
    raw.cultureNo ?? // EventDto.cultureNo
    _raw.id ??
    (Number.isFinite(Number(_csv.cultureno))
      ? Number(_csv.cultureno)
      : undefined);

  const title =
    normStr(raw.title) ||
    normStr(raw.cultureName) || // EventDto.cultureName
    normStr(_csv.culturename) ||
    normStr(_raw.title) ||
    "";

  const gu =
    normStr(raw.gu) ||
    normStr(raw.district) || // EventDto.district
    normStr(_csv.district) ||
    normStr(_raw.gu) ||
    "";

  const place =
    normStr(raw.place) ||
    normStr(raw.organizationName) || // EventDto.organizationName
    normStr(_csv.organizationname) ||
    normStr(_raw.place) ||
    "";

  const address =
    normStr(raw.address) ||
    normStr(raw.cultureAddress) || // EventDto.cultureAddress
    normStr(_csv.cultureaddress) ||
    normStr(_raw.address) ||
    "";

  const phone =
    normStr(raw.phone) || normStr(_csv.phone) || normStr(_raw.phone) || "";

  const dateStart =
    normStr(raw.dateStart) ||
    normStr(raw.startDate) || // EventDto.startDate
    normStr(_csv.startdate) ||
    normStr(_csv.startdateRaw) ||
    normStr(_raw.dateStart) ||
    "";

  const dateEnd =
    normStr(raw.dateEnd) ||
    normStr(raw.endDate) || // EventDto.endDate
    normStr(_csv.enddate) ||
    normStr(_csv.enddateRaw) ||
    normStr(_raw.dateEnd) ||
    dateStart;

  const thumbUrl =
    normStr(raw.thumbUrl) ||
    normStr(raw.thumbnailImage) || // EventDto.thumbnailImage
    normStr(_csv.thumbnailimage) ||
    normStr(_raw.thumbUrl) ||
    "";

  const website =
    normStr(raw.website) ||
    normStr(raw.portalUrl) || // EventDto.portalUrl
    normStr(_csv.portalurl) ||
    normStr(_raw.website) ||
    "";

  const images =
    Array.isArray(raw.images) && raw.images.length
      ? raw.images
      : thumbUrl
      ? [thumbUrl]
      : [];

  const { descriptionHtml, summary, description } = makeDescriptions({
    ...raw,
    _csv,
    _raw,
  });

  const timeText = makeTimeText({ ...raw, _csv, _raw });
  const openHours = makeOpenHours({ ...raw, _csv, _raw });
  const feeText = makeFeeText({ ...raw, _csv, _raw, isFree: raw.isFree });

  const closedDays =
    normStr(raw.closedDays) ||
    normStr(_csv.closedDays) ||
    normStr(_raw.closedDays) ||
    "";

  const tags = Array.isArray(raw.tags) ? raw.tags : [];

  return {
    id,
    title,
    gu,
    place,
    address,
    phone,
    dateStart,
    dateEnd,
    thumbUrl,
    images,
    descriptionHtml,
    summary,
    description,
    timeText,
    openHours,
    feeText,
    closedDays,
    website,
    tags,
    _csv,
    _raw,
  };
}

/** 상세/목록 병합: 비어있는 값은 덮어쓰지 않음 */
export function mergeEvent(prev, detailed) {
  if (!prev) return detailed || null;
  if (!detailed) return prev;

  return {
    ...prev,
    title: pick(detailed.title, prev.title),
    summary: pick(detailed.summary, prev.summary),
    description: pick(detailed.description, prev.description),
    descriptionHtml: pick(detailed.descriptionHtml, prev.descriptionHtml),
    feeText: pick(detailed.feeText, prev.feeText),
    timeText: pick(detailed.timeText, prev.timeText),
    openHours: pick(detailed.openHours, prev.openHours),
    closedDays: pick(detailed.closedDays, prev.closedDays),
    phone: pick(detailed.phone, prev.phone),
    website: pick(detailed.website, prev.website),
    address: pick(detailed.address, prev.address),
    place: pick(detailed.place, prev.place),
    gu: pick(detailed.gu, prev.gu),
    tags: pick(detailed.tags, prev.tags),
    id: pick(detailed.id, prev.id),
    dateStart: pick(detailed.dateStart, prev.dateStart),
    dateEnd: pick(detailed.dateEnd, prev.dateEnd),
    images:
      (Array.isArray(detailed.images) && detailed.images.length > 0
        ? detailed.images
        : prev.images) || [],
    thumbUrl: detailed.thumbUrl || prev.thumbUrl || "",
    _csv: { ...(prev._csv || {}), ...(detailed._csv || {}) },
    _raw: detailed._raw || prev._raw,
  };
}
