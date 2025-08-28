// src/utils/eventNormalizer.js
import dayjs from "dayjs";

/** 우선순위 매핑(있으면 이걸 먼저 씀) */
const COLUMN_MAP = {
  id: ["id", "event_id", "contentId"],
  title: ["culutename", "title", "name", "eventName"],
  summary: ["summary", "intro"],
  descriptionHtml: ["descriptionHtml", "description", "detail", "body_html"],
  dateStart: ["startdate"],
  dateEnd: ["enddate"],
  timeText: ["time", "eventTime", "openingHours"],
  place: ["place", "venue", "organizationname"],
  gu: ["district"],
  address: ["cultureaddress", "address"],
  phone: ["phone", "tel"],
  website: ["portalurl", "website", "url"],
  feeText: ["fee"],
  isfree: ["isfree"],
  openHours: ["openHours"],
  closedDays: ["closedDays"],
  category: ["category"],
  targetaudience: ["targetaudience"],
  images: ["images", "thumbnailimage", "thumbUrl", "mainImage"],
  tags: ["tags", "keywords"],
};

function pick(raw, keys = []) {
  for (const k of keys) {
    const v = raw?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}

/** 키 자동 탐지: 'start','end'와 'date/일/시작/종료' 등 포함시 후보 */
function autoFindKey(raw, type /* 'start' | 'end' */) {
  if (!raw) return undefined;
  const keys = Object.keys(raw);
  const wantStart = type === "start";
  const re = wantStart
    ? /(start[^a-z]?|s(?:tart)?_?date|시작|from|begin)/i
    : /(end[^a-z]?|e(?:nd)?_?date|종료|to|until|finish)/i;
  return keys.find((k) => re.test(k));
}

/** 느슨한 날짜 파서 (YYYY.MM.DD / YYYY-M-D / "2025.08.03 00:00" 등 폭넓게 처리) */
function parseDateLoose(v) {
  if (!v) return undefined;
  const s = String(v).trim();
  const m = s.match(/(\d{4})\D*?(\d{1,2})\D*?(\d{1,2})/);
  if (m) {
    const iso = `${m[1]}-${String(+m[2]).padStart(2, "0")}-${String(
      +m[3]
    ).padStart(2, "0")}`;
    if (dayjs(iso).isValid()) return iso;
  }
  const try2 = s.replace(/[./]/g, "-").replace(/\s+/, " ");
  const d = dayjs(try2);
  return d.isValid() ? d.format("YYYY-MM-DD") : undefined;
}

function coerceArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  const s = String(val);
  if (s.includes("|"))
    return s
      .split("|")
      .map((x) => x.trim())
      .filter(Boolean);
  if (s.includes(","))
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  return [s];
}

function collectImageColumns(raw) {
  const keys = Object.keys(raw || {});
  const imgKeys = keys
    .filter((k) => /^img\d+$|^image\d+$|^image_\d+$|^img_\d+$/i.test(k))
    .sort(
      (a, b) =>
        parseInt(a.match(/\d+/)?.[0] || "0", 10) -
        parseInt(b.match(/\d+/)?.[0] || "0", 10)
    );
  return imgKeys.map((k) => raw[k]).filter(Boolean);
}

export function normalizeEvent(raw) {
  if (!raw || typeof raw !== "object") return null;

  // 우선 매핑으로 시도
  const idRaw = pick(raw, COLUMN_MAP.id);
  const title = pick(raw, COLUMN_MAP.title) || "-";
  const startRaw =
    pick(raw, COLUMN_MAP.dateStart) ?? raw[autoFindKey(raw, "start")];
  const endRaw = pick(raw, COLUMN_MAP.dateEnd) ?? raw[autoFindKey(raw, "end")];

  const dateStart = parseDateLoose(startRaw);
  const dateEnd = parseDateLoose(endRaw) || dateStart;

  let images = coerceArray(pick(raw, COLUMN_MAP.images));
  if (images.length === 0) images = collectImageColumns(raw);
  const thumbUrl =
    images[0] || pick(raw, ["thumbnailimage", "thumbUrl", "image"]);

  const tags = [
    pick(raw, COLUMN_MAP.category),
    pick(raw, COLUMN_MAP.targetaudience),
    ...coerceArray(pick(raw, COLUMN_MAP.tags)),
  ].filter(Boolean);

  return {
    id: idRaw || `${title}-${dateStart || ""}`,
    title,
    summary: pick(raw, COLUMN_MAP.summary) || "",
    descriptionHtml: pick(raw, COLUMN_MAP.descriptionHtml) || "",
    dateStart,
    dateEnd,
    timeText: pick(raw, COLUMN_MAP.timeText) || "",
    place: pick(raw, COLUMN_MAP.place) || "",
    gu: pick(raw, COLUMN_MAP.gu) || "",
    address: pick(raw, COLUMN_MAP.address) || "",
    phone: pick(raw, COLUMN_MAP.phone) || "",
    website: pick(raw, COLUMN_MAP.website) || "",
    feeText:
      pick(raw, COLUMN_MAP.feeText) || pick(raw, COLUMN_MAP.isfree) || "",
    openHours: pick(raw, COLUMN_MAP.openHours) || "",
    closedDays: pick(raw, COLUMN_MAP.closedDays) || "",
    images,
    thumbUrl,
    tags,
    _csv: {
      startdateRaw: startRaw || "",
      enddateRaw: endRaw || "",
      category: pick(raw, COLUMN_MAP.category) || "",
      targetaudience: pick(raw, COLUMN_MAP.targetaudience) || "",
      organizationname: raw?.organizationname || "",
      portalurl: pick(raw, COLUMN_MAP.website) || "",
      description: raw?.description || "",
    },
    _raw: raw, // 전체 원문 보관(최후 fallback)
  };
}
