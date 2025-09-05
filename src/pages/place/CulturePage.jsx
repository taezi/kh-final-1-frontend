// src/pages/culture/CulturePage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useLocation, useNavigate } from "react-router-dom";
import useQueryParam from "../../utils/useQueryParam";
import { getCalendar, getEventList } from "../../service/placeAPI";
import "../../css/CulturePage.css";
import WeatherWidget from "../../components/WeatherWidget";
import SEOUL_NIGHT from "../../img/seoul-night.jpg";
import useAuthStore from "../../store/authStore";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../../service/bookmarkAPI";

dayjs.extend(isBetween);

/** ─────────────────────────  상단 고정 배너  ─────────────────────────
 *  1) 기본: public/hero/seoul-night.jpg (프로젝트에 넣기만 하면 됨)
 *  2) 폴백: 외부 고정 야경 사진 2장 (Seoul night skyline)
 *  ※ 캐러셀/무작위 이미지 일체 없음
 */
const BANNER_SOURCES = [SEOUL_NIGHT];

function HeroBannerFixed({ title }) {
  const [idx, setIdx] = useState(0);
  const src = BANNER_SOURCES[idx];

  const handleError = () => {
    setIdx((i) => (i + 1 < BANNER_SOURCES.length ? i + 1 : i));
  };

  return (
    <div
      className="hero-band"
      style={{
        background: "#000",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100vw",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "1940/730",
          overflow: "hidden",
        }}
      >
        <img
          src={src}
          onError={handleError}
          alt="Seoul night skyline"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 70%",
            filter: "brightness(.9)",
          }}
          loading="eager"
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(0,0,0,.3))",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 32,
            transform: "translateX(-50%)",
            width: "min(1100px, calc(100vw - 32px))",
            color: "#fff",
            fontWeight: 900,
            fontSize: 42,
            letterSpacing: "-.5px",
            textShadow: "0 2px 10px rgba(0,0,0,.35)",
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
}

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
  const user = useAuthStore((state) => state.user);
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { gu: guQS = "", date: dateQS = "" } = useQueryParam(
    routerLocation.search
  );

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

  useEffect(() => {
    if (!user) {
      setLikes(new Set());
    }
  }, [user]);

  // 북마크 가져오기
  useEffect(() => {
    if (!user) return;
    getBookmarks(user.userno, "event")
      .then((list) => {
        const eventBookmarks = list
          .filter((b) => b.contenttype === "event")
          .map((b) => Number(b.contentno));
        setLikes(new Set(eventBookmarks));
      })
      .catch((err) => {
        console.error("북마크 불러오기 실패:", err);
      });
  }, [user]);

  const searchRef = useRef(null);

  // 북마크 토글
  const toggleLike = async (id) => {
    if (!user) {

      alert("로그인 후 이용해주세요.");

      return;
    }
    const userno = user.userno;
    const bookmarkData = { userno, contentno: id, contenttype: "event" };

    try {
      if (likes.has(id)) {
        await removeBookmark(bookmarkData);
        alert("북마크가 해제되었습니다.");
        setLikes((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await addBookmark(bookmarkData);
        alert("북마크에 추가되었습니다.");
        setLikes((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
    } catch (error) {
      console.error("북마크 기능 처리 실패:", error);
      alert("찜하기 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const headingGu = gu === "전체" ? "종로구" : gu;

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
  console.log(items);

  return (
    <div className="page">
      {/* ===== 고정 야경 배너 (캐러셀/랜덤 없음) ===== */}
      <HeroBannerFixed title="전시/공연/축제/행사" />

      {/* ===== 본문 ===== */}
      <div className="section pg24">
        {/* 상단: 좌 달력 / 우 다크 카드 */}
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

        {/* GU 칩 */}
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

        {/* 날씨 */}
        <WeatherWidget gu={headingGu} />

        {/* 검색 */}
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

        {/* 카드 그리드 */}
        <div className="ev-grid">
          {items.length === 0 && (
            <div className="empty">조건에 맞는 행사가 없습니다.</div>
          )}
          {items.map((ev) => (
            <article
              key={ev.id}
              className="ev-card"
              onClick={() => navigate(`/culture/${ev.id}`, { state: ev })}
              style={{ cursor: "pointer" }}
            >
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
                {ev.gu} · {ev.timeText || ev.time || ""} ·{" "}
                {dayjs(ev.dateStart).format("M.D")}
                {ev.dateStart !== ev.dateEnd &&
                  `~${dayjs(ev.dateEnd).format("M.D")}`}
              </div>
              <button
                className={`heart ${likes.has(ev.id) ? "is-on" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(ev.id);
                }}
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
