// src/pages/CulturePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useLocation } from "react-router-dom";
import useQueryParam from "../utils/useQueryParam";
import { getCalendar, getEventList, getFeatured } from "../service/placeAPI";
import "../css/CulturePage.css";

// ✅ 모든 import 끝난 뒤에 플러그인 활성화 (import/first 해결)
dayjs.extend(isBetween);

/** ── 25개 자치구 칩 ── */
const GU_LIST = [
  "전체",
  "종로구",
  "중구",
  "용산구",
  "성동구",
  "광진구",
  "동대문구",
  "중랑구",
  "성북구",
  "강북구",
  "도봉구",
  "노원구",
  "은평구",
  "서대문구",
  "마포구",
  "양천구",
  "강서구",
  "구로구",
  "금천구",
  "관악구",
  "동작구",
  "서초구",
  "강남구",
  "송파구",
  "강동구",
];

/** 월 달력 셀(6x7) */
function makeMonthCells(viewMonth) {
  const first = viewMonth.startOf("month");
  const head = first.subtract(first.day(), "day");
  return Array.from({ length: 42 }, (_, i) => head.add(i, "day"));
}

export default function CulturePage() {
  // 쿼리파라미터(gu, date) – 글로벌 location 대신 라우터 location 사용
  const routerLocation = useLocation();
  const { gu: guQS = "", date: dateQS = "" } = useQueryParam(
    routerLocation.search
  );

  // ===== 상단 캐러셀 =====
  const [hero, setHero] = useState([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const heroTimer = useRef(null);
  const HERO_MS = 3500;
  const startAuto = () => {
    stopAuto();
    heroTimer.current = setInterval(
      () => setHeroIdx((i) => (i + 1) % Math.max(hero.length, 1)),
      HERO_MS
    );
  };
  const stopAuto = () => {
    if (heroTimer.current) clearInterval(heroTimer.current);
  };

  // ===== 본문 상태 =====
  const [selectedDate, setSelectedDate] = useState(
    dateQS && dayjs(dateQS).isValid() ? dateQS : dayjs().format("YYYY-MM-DD")
  );
  const [viewMonth, setViewMonth] = useState(
    dayjs(selectedDate).startOf("month")
  );
  const [gu, setGu] = useState(guQS || "전체");
  const [q, setQ] = useState("");
  const [likes, setLikes] = useState(() => new Set());

  const cells = useMemo(() => makeMonthCells(viewMonth), [viewMonth]);
  const fmt = (d) => dayjs(d).format("YYYY-MM-DD");

  // ===== 달력 점 데이터 =====
  const [eventsByDate, setEventsByDate] = useState({});
  const hasDot = (d) => !!eventsByDate[fmt(d)];

  useEffect(() => {
    getCalendar({
      month: viewMonth.format("YYYY-MM"),
      gu: gu === "전체" ? "" : gu,
      q,
    })
      .then((data) => setEventsByDate(data?.eventsByDate || {}))
      .catch(() => setEventsByDate({}));
  }, [viewMonth, gu, q]);

  // ===== 리스트 + 더보기 =====
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  const loadList = (p = 1) =>
    getEventList({
      date: selectedDate,
      gu: gu === "전체" ? "" : gu,
      q,
      page: p,
      size: 12,
    })
      .then((res) => {
        setItems((prev) =>
          p === 1 ? res.items || [] : prev.concat(res.items || [])
        );
        setHasMore(!!res.hasMore);
        setPage(p);
      })
      .catch(() => {
        if (p === 1) {
          setItems([]);
          setHasMore(false);
        }
      });

  useEffect(() => {
    loadList(1);
  }, [selectedDate, gu, q]);

  // ===== 상단 캐러셀 로드 =====
  useEffect(() => {
    const from = viewMonth.startOf("month").format("YYYY-MM-DD");
    const to = viewMonth.endOf("month").format("YYYY-MM-DD");
    getFeatured({ gu: gu === "전체" ? "" : gu, from, to, limit: 4 })
      .then((list) => {
        setHero(
          (list || []).map((ev) => ({
            src: ev.thumbUrl || "https://picsum.photos/1200/700?blur=2",
            title: ev.title,
            sub: `${ev.place} · ${ev.gu} · ${dayjs(ev.dateStart).format(
              "M.D"
            )}${
              ev.dateStart !== ev.dateEnd
                ? `~${dayjs(ev.dateEnd).format("M.D")}`
                : ""
            }`,
            id: ev.id,
          }))
        );
        setHeroIdx(0);
      })
      .catch(() => {
        setHero([
          {
            src: "https://picsum.photos/1200/700",
            title: gu === "전체" ? "서울 문화생활" : `${gu} 문화생활`,
            sub: "데이터를 불러오는 중입니다",
          },
        ]);
        setHeroIdx(0);
      });
  }, [gu, viewMonth]);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [hero.length]);

  const searchRef = useRef(null);
  const toggleLike = (id) =>
    setLikes((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const headingGu = gu === "전체" ? "강남구" : gu; // 날씨 제목용(임시)

  // 선택일 범위 내 일정(우측 다크 카드)
  const selDayItems = useMemo(() => {
    if (!items?.length) return [];
    return items.filter((ev) =>
      dayjs(selectedDate).isBetween(
        dayjs(ev.dateStart).startOf("day"),
        dayjs(ev.dateEnd).endOf("day"),
        null,
        "[]"
      )
    );
  }, [items, selectedDate]);

  return (
    <div className="page">
      {/* ====== HERO (full-bleed) ====== */}
      <div className="hero-band">
        <div
          className="hero hero-carousel"
          style={{
            backgroundImage: hero[heroIdx]?.src
              ? `url(${hero[heroIdx].src})`
              : "none",
          }}
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
          aria-label="문화 히어로 포스터"
        >
          {/* 말풍선 */}
          <div className="hero-note">
            <div className="bubble">
              <div className="title">{hero[heroIdx]?.title || ""}</div>
              <div className="meta">{hero[heroIdx]?.sub || ""}</div>
            </div>
          </div>

          {/* 좌우 화살표 + 점 */}
          <button
            className="hero-arrow left"
            onClick={() =>
              setHeroIdx(
                (i) =>
                  (i - 1 + Math.max(hero.length, 1)) % Math.max(hero.length, 1)
              )
            }
            aria-label="이전 포스터"
          >
            ‹
          </button>
          <button
            className="hero-arrow right"
            onClick={() =>
              setHeroIdx((i) => (i + 1) % Math.max(hero.length, 1))
            }
            aria-label="다음 포스터"
          >
            ›
          </button>
          <div className="hero-dots">
            {(hero.length ? hero : [1, 2, 3, 4]).map((_, i) => (
              <button
                key={i}
                className={`dot ${i === heroIdx ? "is-active" : ""}`}
                onClick={() => setHeroIdx(i)}
                aria-label={`${i + 1}번 포스터`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="section pg24">
        {/* ===== 상단: 좌 달력 / 우 다크 카드 ===== */}
        <div className="pg24-head">
          {/* 미니 달력 */}
          <div className="mini-cal">
            <div className="mc-top">
              <div className="mc-month">{viewMonth.format("YYYY.MM")}</div>
              <div className="mc-nav">
                <button
                  onClick={() => setViewMonth((v) => v.subtract(1, "month"))}
                  aria-label="이전 달"
                >
                  ‹
                </button>
                <button
                  onClick={() => setViewMonth((v) => v.add(1, "month"))}
                  aria-label="다음 달"
                >
                  ›
                </button>
              </div>
            </div>
            <div className="mc-week">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="mc-w">
                  {d}
                </div>
              ))}
            </div>
            <div className="mc-grid">
              {cells.map((d) => {
                const dim = d.month() !== viewMonth.month();
                const sel = fmt(d) === selectedDate;
                const has = hasDot(d);
                return (
                  <button
                    key={d.toString()}
                    className={`mc-cell ${dim ? "is-dim" : ""} ${
                      sel ? "is-sel" : ""
                    }`}
                    onClick={() => {
                      setSelectedDate(fmt(d));
                      setPage(1);
                    }}
                  >
                    <span className="mc-num">{d.date()}</span>
                    {has && <span className="mc-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 우측: 다크 카드(선택 날짜 일정 요약) */}
          <div className="dark-card">
            <div className="dc-head">
              {dayjs(selectedDate).format("YYYY.MM.DD(ddd)")}
            </div>
            <ul className="dc-list">
              {selDayItems.length === 0 && (
                <li className="dc-empty">표시할 일정이 없습니다.</li>
              )}
              {selDayItems.slice(0, 7).map((ev) => (
                <li key={ev.id} className="dc-item">
                  <span className="b" />
                  <span className="t">{ev.title}</span>
                  <span className="r">
                    {ev.dateStart} ~ {ev.dateEnd}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== GU 칩 ===== */}
        <div className="pg24-chips">
          {GU_LIST.map((name) => (
            <button
              key={name}
              className={`chip beige ${gu === name ? "active-pink" : ""}`}
              onClick={() => {
                setGu(name);
                setPage(1);
              }}
            >
              {name}
            </button>
          ))}
        </div>

        {/* ===== 날씨 행 (더미) ===== */}
        <div className="weather-row">
          <div className="wr-left">
            <div className="wr-title">서울특별시 {headingGu} 현재 날씨</div>
            <div className="wr-big">⛅ 32°</div>
            <div className="wr-sub">
              구름많음 · 체감 41° · 습도 62% · 풍속 0.2m/s
            </div>
          </div>
          <div className="wr-right">
            {[
              "8.20",
              "8.21",
              "8.22",
              "8.23",
              "8.24",
              "8.25",
              "8.26",
              "8.27",
            ].map((d, i) => (
              <div className="wr-mini" key={i}>
                <div className="d">{d}</div>
                <div className="i">☁️</div>
                <div className="t">
                  <b>32°</b> / 26°
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== 검색 ===== */}
        <div className="pg24-search">
          <div className="label">서울특별시 {headingGu} 문화/행사</div>
          <div className="search-pill">
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="검색어를 입력하세요"
            />
            <button
              aria-label="검색"
              onClick={() => searchRef.current?.focus()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                />
                <line
                  x1="16.5"
                  y1="16.5"
                  x2="22"
                  y2="22"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ===== 카드 그리드 ===== */}
        <div className="ev-grid">
          {items.length === 0 && (
            <div className="empty">조건에 맞는 행사가 없습니다.</div>
          )}
          {items.map((ev) => (
            <article key={ev.id} className="ev-card">
              <div
                className="thumb"
                style={{
                  backgroundImage: `url(${
                    ev.thumbUrl ||
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                  })`,
                }}
              />
              <div className="badge">{ev.place}</div>
              <div className="title">{ev.title}</div>
              <div className="meta">
                {ev.gu} · {ev.time || ""} · {dayjs(ev.dateStart).format("M.D")}
                {ev.dateStart !== ev.dateEnd &&
                  `~${dayjs(ev.dateEnd).format("M.D")}`}
              </div>
              <button
                className={`heart ${likes.has(ev.id) ? "is-on" : ""}`}
                onClick={() => toggleLike(ev.id)}
                title="찜"
              >
                ♡
              </button>
            </article>
          ))}
        </div>

        {/* 더보기 */}
        <div className="center">
          {hasMore ? (
            <button className="more lg" onClick={() => loadList(page + 1)}>
              더보기
            </button>
          ) : (
            <button className="more lg" disabled>
              더보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
