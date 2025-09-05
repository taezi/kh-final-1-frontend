// WeatherWidget 컴포넌트와 이미지를 가져옵니다.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useQueryParam from "../../utils/useQueryParam";
import { getRestList } from "../../service/restAPI";
import "../../css/CafePage.css";
import WeatherWidget from "../../components/WeatherWidget"; // WeatherWidget 컴포넌트 임포트
import SEOUL_NIGHT from "../../img/seoul-night.jpg"; // 배경 이미지 임포트
import { addBookmark, getBookmarks, removeBookmark } from "../../service/bookmarkAPI";
import useAuthStore from "../../store/authStore";


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

export default function RestaurantPage() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const {RestRegion: guQS = "" } = useQueryParam(routerLocation.search);
  const currentUser = useAuthStore((state) => state.user);
  // ===== 본문 상태 =====
  const [restRegion, setGu] = useState(guQS || "전체");
  const [q, setQ] = useState("");
  const [likes, setLikes] = useState(() => new Set());
  

  // ===== 리스트 + 더보기 =====
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  
  const loadList = (p = 1) =>
    getRestList({
      gu: restRegion === "전체" ? "" : restRegion,
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
  }, [restRegion, q]);

  const searchRef = useRef(null);

  // 마운트 시 서버에서 좋아요 데이터 가져오기
  useEffect(() => {
    if (!currentUser) return;

    // 현재 로그인한 사용자(currentUser.userno) 기준 북마크를 가져옴
    getBookmarks(currentUser.userno, "restaurant")
      .then((list) => {
        const restLikes = list
          // 에디터 콘텐츠만 적용
          .filter((b) => b.contenttype === "restaurant")
          .map((b) => Number(b.contentno));
        // Set으로 관리해서 각 사용자의 북마크 상태 반영
        setLikes(new Set(restLikes));
      })
      .catch((err) => console.error("북마크 불러오기 실패:", err));
  }, [currentUser]);

  // 북마크 좋아요 토글
  const toggleLike = async (restNo, e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    const bookmarkData = {
      userno: currentUser.userno,
      contentno: restNo,
      contenttype: "restaurant",
    };

    const currentlyLiked = likes.has(restNo); // 이전 상태 저장

    try {
      // 서버 호출
      if (currentlyLiked) {
        await removeBookmark(bookmarkData);
      } else {
        await addBookmark(bookmarkData);
      }

      // 상태 업데이트
      setLikes(prev => {
        const newSet = new Set(prev);
        currentlyLiked ? newSet.delete(restNo) : newSet.add(restNo);
        return newSet;
      });
    } catch (err) {
      console.error(err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };

  const restRegionSelected = restRegion === "전체" ? "종로구" : restRegion;

  return (
    <div className="page">
      {/* ===== 고정 야경 배너 (캐러셀/랜덤 없음) ===== */}
      <HeroBannerFixed title="서울 카페" />

      {/* ===== 본문 ===== */}
      <div className="section pg24"> {/* <--- 이 div 태그를 추가하여 전체를 감쌌습니다. */}
        {/* GU 칩 */}
        <div className="pg24-chips">
          {CAFEREGION.map((name) => (
            <button
              key={name}
              className={`chip beige ${
                restRegion === name ? "active-pink" : ""
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
        <WeatherWidget gu={restRegionSelected} /> {/* <--- WeatherWidget를 추가하고 prop 이름을 gu로 변경했습니다. */}

        {/* 검색 */}
        <div className="pg24-search">
          <div className="label">서울특별시 {restRegionSelected} 식당</div>
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
          {items.map((rest) => (
            <article
              key={rest.restNo}
              className="ev-card"
              onClick={() =>
                navigate(`/restaurants/${rest.restNo}`, { state: { restDetail: rest } })
              }
              style={{ cursor: "pointer" }}
            >
              <div
                className="thumb"
                style={{
                  backgroundImage: `url(${
                    rest.restImgAddress ||
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                  })`,
                }}
              />
              <div className="badge">{rest.restRegion}</div>
              <div className="title">{rest.restName}</div>
              <div className="meta">{rest.restBranch}</div>
              <button
        className={`heart ${likes.has(rest.restNo) ? "is-on" : ""}`}
        // 수정된 부분: onClick 핸들러에서 e를 toggleLike 함수에 전달합니다.
        onClick={(e) => {
          toggleLike(rest.restNo, e);
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