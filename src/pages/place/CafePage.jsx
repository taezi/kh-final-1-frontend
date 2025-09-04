// WeatherWidget 컴포넌트와 이미지를 가져옵니다.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useQueryParam from "../../utils/useQueryParam";
import { getCafeList } from "../../service/cafeAPI";
import "../../css/CulturePage.css";
import WeatherWidget from "../../components/WeatherWidget"; // WeatherWidget 컴포넌트 임포트
import SEOUL_NIGHT from "../../img/seoul-night.jpg"; // 배경 이미지 임포트

/** ─────────────────────────  상단 고정 배너  ─────────────────────────
 * 1) 기본: public/hero/seoul-night.jpg (프로젝트에 넣기만 하면 됨)
 * 2) 폴백: 외부 고정 야경 사진 2장 (Seoul night skyline)
 * ※ 캐러셀/무작위 이미지 일체 없음
 */
const BANNER_SOURCES = [SEOUL_NIGHT];

// 상단 고정 배너 컴포넌트입니다.
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
            objectFit: "cover", // 꽉 채움
            objectPosition: "center 70%", // 스카이라인/불꽃 쪽 비중
            filter: "brightness(.9)",
          }}
          loading="eager"
        />

        {/* 상하 그라데이션: 가독성 확보 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,0) 35%, rgba(0,0,0,0) 70%, rgba(0,0,0,.3))",
          }}
        />

        {/* 큰 제목 */}
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
const CAFEREGION = [
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

export default function CafePage() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { CafeRegion: guQS = "" } = useQueryParam(routerLocation.search);

  // ===== 본문 상태 =====
  const [cafeRegion, setGu] = useState(guQS || "전체");
  const [q, setQ] = useState("");
  const [likes, setLikes] = useState(() => new Set());

  // ===== 리스트 + 더보기 =====
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  const loadList = (p = 1) =>
    getCafeList({
      gu: cafeRegion === "전체" ? "" : cafeRegion,
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
  }, [cafeRegion, q]);

  const searchRef = useRef(null);
  const toggleLike = (cafeNo) =>
    setLikes((prev) => {
      const n = new Set(prev);
      n.has(cafeNo) ? n.delete(cafeNo) : n.add(cafeNo);
      return n;
    });

  const cafeRegionSelected = cafeRegion === "전체" ? "종로구" : cafeRegion;

  return (
    <div className="page">
      {/* ===== 고정 야경 배너 (캐러셀/랜덤 없음) ===== */}
      <HeroBannerFixed title="전시/공연/축제/행사" />

      {/* ===== 본문 ===== */}
      <div className="section pg24"> {/* <--- 이 div 태그를 추가하여 전체를 감쌌습니다. */}
        {/* GU 칩 */}
        <div className="pg24-chips">
          {CAFEREGION.map((name) => (
            <button
              key={name}
              className={`chip beige ${
                cafeRegion === name ? "active-pink" : ""
              }`}
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
        <WeatherWidget gu={cafeRegionSelected} /> {/* <--- WeatherWidget를 추가하고 prop 이름을 gu로 변경했습니다. */}

        {/* 검색 */}
        <div className="pg24-search">
          <div className="label">서울특별시 {cafeRegionSelected} 식당</div>
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
            <div className="empty">조건에 맞는 식당이 없습니다.</div>
          )}
          {items.map((cafe) => (
            <article
              key={cafe.cafeNo}
              className="ev-card"
              onClick={() =>
                navigate(`/cafe/${cafe.cafeNo}`, { state: cafe })
              }
              style={{ cursor: "pointer" }}
            >
              <div
                className="thumb"
                style={{
                  backgroundImage: `url(${
                    cafe.cafeImgAddress ||
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                  })`,
                }}
              />
              <div className="badge">{cafe.cafeName}</div>
              <div className="title">{cafe.cafeBranch}</div>
              <div className="meta">{cafe.cafeRegion}</div>
              <button
                className={`heart ${likes.has(cafe.cafeNo) ? "is-on" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(cafe.cafeNo);
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