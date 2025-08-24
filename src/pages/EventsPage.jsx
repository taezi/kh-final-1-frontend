// src/pages/EventsPage.jsx
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";

/** ---------------- Mock (API 붙기 전) ---------------- */
const events = [
  {
    id: 101,
    title: "서울시립미술관 기획전",
    place: "SeMA",
    gu: "중구",
    time: "19:00",
    dateStart: "2025-08-20",
    dateEnd: "2025-08-30",
  },
  {
    id: 102,
    title: "UAUS 14기 네이처 전시",
    place: "DDP",
    gu: "중구",
    time: "11:00",
    dateStart: "2025-08-18",
    dateEnd: "2025-08-27",
  },
  {
    id: 103,
    title: "광화문 야외영화 상영",
    place: "세종문화회관 앞",
    gu: "종로구",
    time: "19:30",
    dateStart: "2025-08-21",
    dateEnd: "2025-08-21",
  },
  {
    id: 104,
    title: "홍대 라이브 클럽데이",
    place: "상상마당",
    gu: "마포구",
    time: "20:00",
    dateStart: "2025-08-22",
    dateEnd: "2025-08-22",
  },
  {
    id: 105,
    title: "성수길 마켓 & 공연",
    place: "성수동",
    gu: "성동구",
    time: "16:00",
    dateStart: "2025-08-23",
    dateEnd: "2025-08-23",
  },
  {
    id: 106,
    title: "강남 뮤지컬 위크",
    place: "COEX",
    gu: "강남구",
    time: "19:30",
    dateStart: "2025-08-25",
    dateEnd: "2025-08-30",
  },
  {
    id: 107,
    title: "어린이 과학체험전",
    place: "국립과학관",
    gu: "동작구",
    time: "11:00",
    dateStart: "2025-08-20",
    dateEnd: "2025-08-28",
  },
  {
    id: 108,
    title: "구로 거리공연",
    place: "G밸리",
    gu: "구로구",
    time: "18:00",
    dateStart: "2025-08-21",
    dateEnd: "2025-08-21",
  },
  {
    id: 109,
    title: "관악 재즈 나이트",
    place: "서울대입구",
    gu: "관악구",
    time: "19:00",
    dateStart: "2025-08-21",
    dateEnd: "2025-08-23",
  },
  {
    id: 110,
    title: "건대 예술마켓",
    place: "어린이대공원",
    gu: "광진구",
    time: "13:00",
    dateStart: "2025-08-24",
    dateEnd: "2025-08-24",
  },
];

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

/** ---------------- 유틸 ---------------- */
const fmt = (d) => dayjs(d).format("YYYY-MM-DD");
const inRange = (d, s, e) => {
  const x = dayjs(d).valueOf();
  return (
    x >= dayjs(s).startOf("day").valueOf() &&
    x <= dayjs(e).endOf("day").valueOf()
  );
};

// 월 6x7 셀(일~토) 생성 (플러그인 없이)
function makeMonthCells(viewMonth) {
  const first = viewMonth.startOf("month");
  const head = first.subtract(first.day(), "day"); // 달력 첫 셀 (해당 월의 첫 주 일요일)
  return Array.from({ length: 42 }, (_, i) => head.add(i, "day"));
}

export default function EventsPage() {
  const today = fmt(dayjs());
  const [selectedDate, setSelectedDate] = useState(today);
  const [view, setView] = useState(dayjs(selectedDate).startOf("month"));
  const [gu, setGu] = useState("전체");
  const [q, setQ] = useState("");
  const [likes, setLikes] = useState(() => new Set());
  const [page, setPage] = useState(1);

  const cells = useMemo(() => makeMonthCells(view), [view]);

  // 날짜에 행사 존재 여부 맵
  const hasMap = useMemo(() => {
    const m = new Map();
    events.forEach((ev) => {
      for (
        let d = dayjs(ev.dateStart);
        d.isBefore(dayjs(ev.dateEnd).add(1, "day"));
        d = d.add(1, "day")
      ) {
        m.set(fmt(d), true);
      }
    });
    return m;
  }, []);

  // 선택 날짜 + 필터
  const filtered = useMemo(() => {
    return events
      .filter((ev) => inRange(selectedDate, ev.dateStart, ev.dateEnd))
      .filter((ev) => (gu === "전체" ? true : ev.gu === gu))
      .filter((ev) =>
        q.trim() === ""
          ? true
          : (ev.title + ev.place).toLowerCase().includes(q.toLowerCase())
      );
  }, [selectedDate, gu, q]);

  const perPage = 9;
  const list = filtered.slice(0, page * perPage);
  const canMore = list.length < filtered.length;

  const toggleLike = (id) => {
    setLikes((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const headingGu = gu === "전체" ? "강남구" : gu; // 피그마 문구 자리 (예시)

  return (
    <div className="page">
      <div className="section pg24">
        {/* 상단: 좌 달력 / 우 다크 카드 */}
        <div className="pg24-head">
          {/* 달력 */}
          <div className="mini-cal">
            <div className="mc-top">
              <div className="mc-month">{view.format("YYYY.MM")}</div>
              <div className="mc-nav">
                <button
                  onClick={() => setView(view.subtract(1, "month"))}
                  aria-label="이전 달"
                >
                  ‹
                </button>
                <button
                  onClick={() => setView(view.add(1, "month"))}
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
                const dim = d.month() !== view.month();
                const sel = fmt(d) === selectedDate;
                const has = !!hasMap.get(fmt(d));
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

          {/* 우: 선택 날짜 카드 (어두운 패널) */}
          <div className="dark-card">
            <div className="dc-head">
              {dayjs(selectedDate).format("YYYY.MM.DD(ddd)")}
            </div>
            <ul className="dc-list">
              {filtered.length === 0 && (
                <li className="dc-empty">표시할 일정이 없습니다.</li>
              )}
              {filtered.map((ev) => (
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

        {/* 칩 (베이지) */}
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

        {/* 날씨 + 미니 예보 (좌측 큰 32°, 우측 작은 박스들) */}
        <div className="weather-row">
          <div className="wr-left">
            <div className="wr-title">서울특별시 {headingGu} 현재 날씨</div>
            <div className="wr-big">32°</div>
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

        {/* 검색 (우측 라운드 인풋) */}
        <div className="pg24-search">
          <div className="label">서울특별시 {headingGu} 문화/행사</div>
          <div className="search-pill">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="검색어를 입력하세요"
            />
            <button aria-label="검색">
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
          {list.length === 0 && (
            <div className="empty">조건에 맞는 행사가 없습니다.</div>
          )}
          {list.map((ev) => (
            <article key={ev.id} className="ev-card">
              <div
                className="thumb"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop)",
                }}
              />
              <div className="badge">{ev.place}</div>
              <div className="title">{ev.title}</div>
              <div className="meta">
                {ev.gu} · {ev.time} · {dayjs(ev.dateStart).format("M.D")}
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

        <div className="center">
          {canMore ? (
            <button className="more lg" onClick={() => setPage((p) => p + 1)}>
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
