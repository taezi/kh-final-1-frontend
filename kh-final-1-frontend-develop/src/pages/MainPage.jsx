import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import "../css/MainPage.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import TiltSeoulMap from "../components/TiltSeoulMap";

/** ===== 상단 풀블리드 히어로 캐러셀(4장) ===== */
const HERO_POSTERS = [
  {
    src: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1940&auto=format&fit=crop&fm=jpg",
    title: "서울 스카이라인",
    sub: "남산에서 내려다보는 도심의 오후",
  },
  {
    src: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1940&auto=format&fit=crop&fm=jpg",
    title: "한강의 밤",
    sub: "야경과 함께하는 리버사이드 산책",
  },
  {
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1940&auto=format&fit=crop&fm=jpg",
    title: "경복궁의 아침",
    sub: "고즈넉한 한옥의 정취를 느껴봐요",
  },
  {
    src: "https://images.unsplash.com/photo-1557484461-b91ad19d4ef9?q=80&w=1940&auto=format&fit=crop&fm=jpg",
    title: "성수의 감성",
    sub: "카페·공방·갤러리, 주말 산책 코스",
  },
];

function TopBar() {
  const { user, logout } = useAuthStore();
  return (
    <div className="topbar">
      <div className="brand">
        <span>KH</span> MOVIE
        <i className="underline" />
      </div>
      <nav className="gnb">
        <Link to="/" className="link">
          플레이스
        </Link>
        <Link to="/culture" className="link">
          추천
        </Link>
      </nav>
      <div className="actions">
        <div className="pill weather">
          ☀️ <b>32.7℃</b>
        </div>
        {!user ? (
          <Link to="/login" className="pill login">
            로그인
          </Link>
        ) : (
          <button className="pill login" onClick={logout}>
            로그아웃
          </button>
        )}
      </div>
    </div>
  );
}

function DateRail({ start, onPrev, onNext, selected }) {
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => dayjs(start).add(i, "day")),
    [start]
  );
  return (
    <div className="date-rail">
      <button className="rail-arrow" onClick={onPrev} aria-label="이전">
        ‹
      </button>
      <div className="rail-track">
        <div className="rail-line" />
        {days.map((d) => {
          const isToday = d.isSame(dayjs(), "day");
          const isSel = selected && d.isSame(selected, "day");
          return (
            <div
              key={d.toString()}
              className={`tick ${isToday ? "is-today" : ""} ${
                isSel ? "is-sel" : ""
              }`}
            >
              <div className="dow">
                {["일", "월", "화", "수", "목", "금", "토"][d.day()]}
              </div>
              <div className="num">{d.date()}</div>
            </div>
          );
        })}
      </div>
      <button className="rail-arrow" onClick={onNext} aria-label="다음">
        ›
      </button>
    </div>
  );
}

export default function MainPage() {
  const navigate = useNavigate();
  const [selectedGu, setSelectedGu] = useState("");
  const [railStart, setRailStart] = useState(dayjs().subtract(2, "day"));
  const [selDate, setSelDate] = useState(dayjs());

  // 히어로 자동 재생
  const [heroIdx, setHeroIdx] = useState(0);
  const heroTimer = useRef(null);
  const HERO_MS = 3500;
  const startAuto = () => {
    stopAuto();
    heroTimer.current = setInterval(
      () => setHeroIdx((i) => (i + 1) % HERO_POSTERS.length),
      HERO_MS
    );
  };
  const stopAuto = () => {
    if (heroTimer.current) clearInterval(heroTimer.current);
  };
  useEffect(() => {
    startAuto();
    return stopAuto;
  }, []);

  const cards = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `샘플 행사 #${i + 1}`,
        where: "서울 어딘가 · 19:00",
      })),
    []
  );
  const scroller = useRef(null);

  return (
    <>
      {/* ======= Full-bleed Hero band ======= */}
      <div className="hero-band">
        <div
          className="hero hero-carousel"
          style={{ backgroundImage: `url(${HERO_POSTERS[heroIdx].src})` }}
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
          aria-label="서울시 홍보 포스터"
        >
          <TopBar />
          <div className="hero-note">
            <div className="bubble">
              <div className="title">{HERO_POSTERS[heroIdx].title}</div>
              <div className="meta">{HERO_POSTERS[heroIdx].sub}</div>
            </div>
          </div>
          <button
            className="hero-arrow left"
            onClick={() =>
              setHeroIdx(
                (i) => (i - 1 + HERO_POSTERS.length) % HERO_POSTERS.length
              )
            }
            aria-label="이전 포스터"
          >
            ‹
          </button>
          <button
            className="hero-arrow right"
            onClick={() => setHeroIdx((i) => (i + 1) % HERO_POSTERS.length)}
            aria-label="다음 포스터"
          >
            ›
          </button>
          <div className="hero-dots">
            {HERO_POSTERS.map((_, i) => (
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

      {/* ======= 본문 ======= */}
      <div className="page">
        <section className="section">
          <DateRail
            start={railStart}
            selected={selDate}
            onPrev={() =>
              setRailStart((prev) => dayjs(prev).subtract(7, "day"))
            }
            onNext={() => setRailStart((prev) => dayjs(prev).add(7, "day"))}
          />

          <div className="carousel-head">
            <button
              className="arrow"
              onClick={() =>
                scroller.current?.scrollBy({ left: -360, behavior: "smooth" })
              }
            >
              ‹
            </button>
            <div className="carousel" ref={scroller} role="list">
              {cards.map((c, idx) => (
                <article
                  key={c.id}
                  className="car-card center-text"
                  role="listitem"
                  onClick={() =>
                    setSelDate(dayjs(railStart).add(idx % 7, "day"))
                  }
                >
                  <div
                    className="thumb"
                    style={{
                      aspectRatio: "3/4",
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop&fm=jpg)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="title">{c.title}</div>
                  <div className="meta">{c.where}</div>
                </article>
              ))}
            </div>
            <button
              className="arrow"
              onClick={() =>
                scroller.current?.scrollBy({ left: 360, behavior: "smooth" })
              }
            >
              ›
            </button>
          </div>

          <div className="center">
            <button className="more" onClick={() => navigate("/culture")}>
              더 많은 일정 보기
            </button>
          </div>
        </section>

        <div className="ts-title">
          <span className="kr">서울</span>
          <span className="en">seoul</span>
        </div>
        <TiltSeoulMap selectedGu={selectedGu} onSelectGu={setSelectedGu} />

        {selectedGu && (
          <div className="center" style={{ marginTop: 8 }}>
            <span className="chip">선택: {selectedGu}</span>
          </div>
        )}

        <section className="section">
          <h3 className="ed-title">에디터 추천 데이트 코스</h3>
          <div className="ed-wrap">
            <button
              className="ed-arrow left"
              onClick={() =>
                document
                  .querySelector(".ed-carousel")
                  ?.scrollBy({ left: -320, behavior: "smooth" })
              }
              aria-label="이전 추천"
            >
              ‹
            </button>

            <div className="ed-carousel">
              {Array.from({ length: 6 }).map((_, i) => (
                <article key={i} className="ed-card">
                  <div
                    className="thumb"
                    style={{
                      aspectRatio: "4/3",
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop&fm=jpg)",
                      backgroundSize: "cover",
                    }}
                  />
                  <div className="title center">
                    영등포에서 즐기는 최고의 데이트
                  </div>
                  <div className="meta center">산책 · 카페 · 전시</div>
                </article>
              ))}
            </div>

            <button
              className="ed-arrow right"
              onClick={() =>
                document
                  .querySelector(".ed-carousel")
                  ?.scrollBy({ left: 320, behavior: "smooth" })
              }
              aria-label="다음 추천"
            >
              ›
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
