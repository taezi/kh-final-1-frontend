import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import TiltSeoulMap from "../components/TiltSeoulMap";
import { getEventList } from "../service/placeAPI";
import "../css/MainPage.css";
import { getPostList } from "../service/editorAPI";

/* Swiper */
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Keyboard, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

/** 히어로 포스터(샘플) */
const HERO_POSTERS = [
  {
    src: "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1940&auto=format&fit=crop&fm=jpg",
    title: "서울 스카이라인",
    sub: "남산에서 내려다보는 도심의 오후",
  },
  {
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1940&auto=format&fit=crop&fm=jpg",
    title: "경복궁의 아침",
    sub: "고즈넉한 한옥의 정취",
  },
  {
    src: "https://images.unsplash.com/photo-1557484461-b91ad19d4ef9?q=80&w=1940&auto=format&fit=crop&fm=jpg",
    title: "성수의 감성",
    sub: "카페·공방·갤러리 산책",
  },
  {
    src: "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1940&auto=format&fit=crop&fm=jpg",
    title: "한강의 밤",
    sub: "리버사이드 야경",
  },
];

/** 날짜 레일(7일) */
function DateRail({ start, selected, onChange, onPrev, onNext }) {
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => dayjs(start).add(i, "day")),
    [start]
  );

  const headDay = dayjs(selected);
  const month = headDay.format("M");
  const day = headDay.format("D");
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][headDay.day()];

  return (
    <>
      <div className="home-dateHead">
        <span className="mon">{month}월</span>
        <span className="bar">|</span>
        <span className="day">{day}</span>
        <span className="dow">({dow})</span>
      </div>

      <div className="home-dateRail">
        <button
          className="home-railArrow"
          onClick={onPrev}
          aria-label="이전 주"
        >
          ‹
        </button>

        <div className="home-railTrack">
          <div className="home-railLine" />
          {days.map((d) => {
            const isSel = d.isSame(selected, "day");
            const isToday = d.isSame(dayjs(), "day");
            return (
              <button
                key={d.format("YYYY-MM-DD")}
                className={`home-tick ${isSel ? "is-sel" : ""} ${
                  isToday ? "is-today" : ""
                }`}
                onClick={() => onChange(d)}
                aria-label={d.format("YYYY-MM-DD")}
              >
                <div className="dow-mini">
                  {["일", "월", "화", "수", "목", "금", "토"][d.day()]}
                </div>
                <div className="num">{d.date()}</div>
              </button>
            );
          })}
        </div>

        <button
          className="home-railArrow"
          onClick={onNext}
          aria-label="다음 주"
        >
          ›
        </button>
      </div>
    </>
  );
}

/** Swiper 브레이크포인트(정수) */
const BP = {
  0: { slidesPerView: 1, spaceBetween: 10 },
  480: { slidesPerView: 2, spaceBetween: 12 },
  768: { slidesPerView: 3, spaceBetween: 14 },
  1024: { slidesPerView: 4, spaceBetween: 16 },
  1280: { slidesPerView: 5, spaceBetween: 16 },
};
/** 래퍼 폭 기준 정렬 보정(이벤트 루프 유발 호출 없음) */
function alignSlidesSafe(swiper) {
  try {
    if (!swiper || swiper.destroyed) return;

    const wrap =
      swiper.wrapperEl || swiper?.el?.querySelector(".swiper-wrapper");
    if (!wrap) return;

    requestAnimationFrame(() => {
      if (!swiper || swiper.destroyed) return;

      const slidesLike =
        swiper.slides && typeof swiper.slides[Symbol.iterator] === "function"
          ? swiper.slides
          : wrap.children;

      const slides = Array.from(slidesLike || []);
      if (!slides.length) return;

      const space =
        typeof swiper.params?.spaceBetween === "number"
          ? swiper.params.spaceBetween
          : 0;

      let totalSlidesWidth = 0;
      slides.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        totalSlidesWidth += rect.width;
        if (i < slides.length - 1) totalSlidesWidth += space;
      });

      const containerWidth =
        swiper.width ??
        swiper?.el?.getBoundingClientRect?.().width ??
        wrap.getBoundingClientRect().width ??
        0;

      const isShort = totalSlidesWidth <= containerWidth + 0.5;

      wrap.style.justifyContent = isShort ? "center" : "flex-start";
      if (isShort) wrap.style.transform = "translate3d(0px,0px,0px)";
      else wrap.style.removeProperty("transform");
    });
  } catch {}
}

const alignSlides = alignSlidesSafe;

export default function MainPage() {
  const navigate = useNavigate();

  /** 날짜/지도 상태 */
  const [selectedGu, setSelectedGu] = useState("");
  const [railStart, setRailStart] = useState(dayjs().startOf("day"));
  const [selDate, setSelDate] = useState(dayjs().startOf("day"));

  /** 히어로 자동재생 */
  const [heroIdx, setHeroIdx] = useState(0);
  const heroTimer = useRef(null);
  const startHeroAuto = () => {
    stopHeroAuto();
    heroTimer.current = setInterval(
      () => setHeroIdx((i) => (i + 1) % HERO_POSTERS.length),
      3500
    );
  };
  const stopHeroAuto = () =>
    heroTimer.current && clearInterval(heroTimer.current);
  useEffect(() => {
    startHeroAuto();
    return stopHeroAuto;
  }, []);

  /** 행사 데이터 */
  const [events, setEvents] = useState([]);
  const [evLoading, setEvLoading] = useState(false);
  const [evError, setEvError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setEvLoading(true);
        setEvError("");
        const res = await getEventList({
          date: dayjs(selDate).format("YYYY-MM-DD"),
          gu: "",
          q: "",
          page: 1,
          size: 20,
        });
        setEvents(res?.items || []);
      } catch (e) {
        setEvError("행사 정보를 불러오지 못했습니다.");
        setEvents([]);
      } finally {
        setEvLoading(false);
      }
    })();
  }, [selDate]);

  /** 날짜 좌/우: 7일 이동 */
  const handlePrevWeek = () => {
    setRailStart((p) => dayjs(p).subtract(7, "day"));
    setSelDate((d) => dayjs(d).subtract(7, "day"));
  };
  const handleNextWeek = () => {
    setRailStart((p) => dayjs(p).add(7, "day"));
    setSelDate((d) => dayjs(d).add(7, "day"));
  };

  /** Swiper 인스턴스 ref — 데이터/리사이즈 때 정렬 호출 */
  const swiperRef = useRef(null);
  useEffect(() => {
    if (swiperRef.current) alignSlides(swiperRef.current);
  }, [events]); // 데이터 바뀔 때 1회 재정렬

  //에디터 추천 데이트 코스
  const [editorList, setEditorList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getPostList(""); // 키워드 없이 전체 불러오기
        const latest = res.eList.slice(0, 6); // 최신 6개
        setEditorList(latest);
      } catch (err) {
        console.error("에디터 추천 불러오기 실패:", err);
      }
    })();
  }, []);
  // console.log("에디터 리스트 데이터:", editorList);
  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <div
        className="home-hero"
        style={{ backgroundImage: `url(${HERO_POSTERS[heroIdx].src})` }}
        onMouseEnter={stopHeroAuto}
        onMouseLeave={startHeroAuto}
      >
        <div className="home-heroGradient" />
        <div className="home-heroNote">
          <div className="bubble">
            <div className="title">{HERO_POSTERS[heroIdx].title}</div>
            <div className="meta">{HERO_POSTERS[heroIdx].sub}</div>
          </div>
        </div>

        <button
          className="home-heroArrow left"
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
          className="home-heroArrow right"
          onClick={() => setHeroIdx((i) => (i + 1) % HERO_POSTERS.length)}
          aria-label="다음 포스터"
        >
          ›
        </button>

        <div className="home-heroDots">
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

      {/* ===== 본문 ===== */}
      <div className="home-page">
        {/* 날짜 + 문화 캐러셀 */}
        <section className="home-section">
          <DateRail
            start={railStart}
            selected={selDate}
            onChange={(d) => setSelDate(d)}
            onPrev={handlePrevWeek}
            onNext={handleNextWeek}
          />

          {evLoading && (
            <div className="home-centerText" style={{ padding: 16 }}>
              불러오는 중…
            </div>
          )}
          {evError && (
            <div className="home-centerText" style={{ padding: 16 }}>
              {evError}
            </div>
          )}

          {!evLoading && !evError && events.length === 0 && (
            <div className="home-empty">선택한 날짜의 일정이 없습니다.</div>
          )}

          {!evLoading && !evError && events.length > 0 && (
            <div className="home-carouselHead">
              {/* 커스텀 내비 버튼 */}
              <button className="home-arrow ev-prev" aria-label="왼쪽으로">
                ‹
              </button>

              <Swiper
                className="home-swiper"
                modules={[Navigation, Autoplay, Keyboard, A11y]}
                onSwiper={(s) => (swiperRef.current = s)}
                navigation={{ prevEl: ".ev-prev", nextEl: ".ev-next" }}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                keyboard={{ enabled: true }}
                a11y={{ enabled: true }}
                effect="slide"
                centeredSlides={false}
                centeredSlidesBounds={false}
                centerInsufficientSlides={false}
                slidesPerView={5}
                spaceBetween={16}
                breakpoints={BP}
                watchOverflow
                observer
                observeParents
                observeSlideChildren
                grabCursor
                onInit={alignSlides}
                onResize={alignSlides}
              >
                {events.map((ev, idx) => {
                  const go = () => navigate(`/culture/${ev.id}`, { state: ev });
                  const thumb =
                    ev.thumbUrl ||
                    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop&fm=jpg";
                  return (
                    <SwiperSlide key={ev.id || idx}>
                      <article
                        className="home-card flip"
                        role="listitem"
                        tabIndex={0}
                        onClick={go}
                        onKeyDown={(e) => e.key === "Enter" && go()}
                        aria-label={`${ev.title} 상세보기`}
                      >
                        <div className="flip-inner">
                          <div className="flip-face flip-front">
                            <div
                              className="home-thumb"
                              style={{ backgroundImage: `url(${thumb})` }}
                            />
                          </div>
                          <div className="flip-face flip-back">
                            <div className="home-back">
                              <div className="t">{ev.title}</div>
                              <div className="m">
                                장소: {ev.place || "-"}
                                <br />
                                구: {ev.gu || "-"}
                                <br />
                                기간: {dayjs(ev.dateStart).format("YYYY.M.D")}
                                {ev.dateStart !== ev.dateEnd &&
                                  `~${dayjs(ev.dateEnd).format("M.D")}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    </SwiperSlide>
                  );
                })}
              </Swiper>

              <button className="home-arrow ev-next" aria-label="오른쪽으로">
                ›
              </button>
            </div>
          )}

          <div className="home-center">
            <button className="home-more" onClick={() => navigate("/culture")}>
              더 많은 일정 보기
            </button>
          </div>
        </section>

        {/* 서울 지도 */}
        <div className="home-tsTitle">
          <span className="kr">서울</span>
          <span className="en">seoul</span>
        </div>
        <TiltSeoulMap selectedGu={selectedGu} onSelectGu={setSelectedGu} />
        {selectedGu && (
          <div className="home-center" style={{ marginTop: 8 }}>
            <span className="home-chip">선택: {selectedGu}</span>
          </div>
        )}

        {/* 에디터 데이트 코스추천 */}
        <section className="home-section">
          <div className="home-edHeader">
            <h3 className="home-edTitle">에디터 추천 데이트 코스</h3>
            <button
              className="editorCourse-more"
              onClick={() => navigate("/editor")}
            >
              더 많은 데이트 코스 보기
            </button>
          </div>
          <div className="home-edWrap">
            <button
              className="home-edArrow left"
              onClick={() =>
                document
                  .querySelector(".home-edCarousel")
                  ?.scrollBy({ left: -320, behavior: "smooth" })
              }
              aria-label="이전 추천"
            >
              ‹
            </button>

            <div className="home-edCarousel">
              {editorList.map((editor) => (
                <article
                  key={editor.editorno}
                  className="home-edCard"
                  onClick={() => navigate(`/editor/${editor.editorno}`)}
                >
                  <div
                    className="thumb"
                    style={{
                      aspectRatio: "4/3",
                      backgroundImage: `url(${editor.thumbnailUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="title center">{editor.editortitle}</div>
                  <div className="hashtags-list">
                    {editor.hashtags &&
                      editor.hashtags.map((tag, idx) => (
                        <span
                          key={`${editor.editorno}-${idx}`}
                          className="tag-pill"
                        >
                          #{typeof tag === "string" ? tag : tag.tagname}
                        </span>
                      ))}
                  </div>
                  <div className="meta center">
                    {editor.editorintro || "에디터 추천"}
                  </div>
                </article>
              ))}
            </div>

            <button
              className="home-edArrow right"
              onClick={() =>
                document
                  .querySelector(".home-edCarousel")
                  ?.scrollBy({ left: 320, behavior: "smooth" })
              }
              aria-label="다음 추천"
            >
              ›
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
