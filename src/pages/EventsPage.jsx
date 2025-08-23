// src/pages/EventsPage.jsx
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";

const sample = [
  {
    id: 1,
    date: "2025-03-21",
    title: "서울시립미술관 기획전",
    gu: "중구",
    time: "19:00",
  },
  {
    id: 2,
    date: "2025-03-21",
    title: "잠실 실내악 페스티벌",
    gu: "송파구",
    time: "18:30",
  },
  {
    id: 3,
    date: "2025-03-22",
    title: "홍대 라이브 클럽데이",
    gu: "마포구",
    time: "20:00",
  },
  {
    id: 4,
    date: "2025-03-25",
    title: "광화문 야외영화 상영",
    gu: "종로구",
    time: "19:30",
  },
];

function useCalendar(seed = dayjs()) {
  const [view, setView] = useState(seed.startOf("month"));
  const weeks = useMemo(() => {
    const start = view.startOf("week");
    const cells = Array.from({ length: 42 }, (_, i) => start.add(i, "day"));
    return Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  }, [view]);
  return { view, setView, weeks };
}

export default function EventsPage() {
  const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));
  const { view, setView, weeks } = useCalendar(dayjs(selected));

  const events = useMemo(
    () => sample.filter((e) => e.date === selected),
    [selected]
  );
  const weekAgenda = useMemo(() => {
    const start = dayjs(selected).startOf("week");
    const end = start.add(6, "day");
    return sample.filter(
      (e) =>
        dayjs(e.date).isAfter(start.subtract(1, "day")) &&
        dayjs(e.date).isBefore(end.add(1, "day"))
    );
  }, [selected]);

  return (
    <div className="page">
      <div className="section grid24">
        <div className="cal-card">
          <div className="cal-head">
            <strong>{view.format("YYYY.MM")}</strong>
            <div className="cal-nav">
              <button onClick={() => setView(view.subtract(1, "month"))}>
                이전
              </button>
              <button onClick={() => setView(view.add(1, "month"))}>
                다음
              </button>
            </div>
          </div>
          <div className="cal-week">
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <div key={d} className="cal-w">
                {d}
              </div>
            ))}
          </div>
          <div className="cal-grid">
            {weeks.flat().map((d) => {
              const dim = d.month() !== view.month();
              const sel = d.format("YYYY-MM-DD") === selected;
              const has = sample.some((e) => e.date === d.format("YYYY-MM-DD"));
              return (
                <button
                  key={d.toString()}
                  onClick={() => setSelected(d.format("YYYY-MM-DD"))}
                  className={`cal-cell ${dim ? "is-dim" : ""} ${
                    sel ? "is-selected" : ""
                  }`}
                >
                  <div>{d.date()}</div>
                  {has && <span className="cal-dot" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="agenda-card">
          <div className="agenda-head">이번 주 일정</div>
          <ul className="agenda-list">
            {weekAgenda.length === 0 && (
              <li className="empty">이번 주 일정이 없습니다.</li>
            )}
            {weekAgenda.map((ev) => (
              <li key={ev.id}>
                <span className="dot" />
                <span className="txt">
                  {dayjs(ev.date).format("M/D")} · {ev.title} · {ev.gu} ·{" "}
                  {ev.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="toolbar">
        <div className="chips">
          {["전체", "종로구", "중구", "마포구", "송파구"].map((gu) => (
            <button key={gu} className="chip">
              {gu}
            </button>
          ))}
        </div>
        <div className="search">
          <input placeholder="서울특별시 강남구 문화/행사" />
          <button>🔍</button>
        </div>
      </div>

      <div className="ev-grid">
        {events.length === 0 && (
          <div className="empty">선택한 날짜의 행사가 없습니다.</div>
        )}
        {events.map((ev) => (
          <article className="ev-card" key={ev.id}>
            <div className="thumb" />
            <div className="title">{ev.title}</div>
            <div className="meta">
              {ev.gu} · {ev.time}
            </div>
          </article>
        ))}
      </div>

      <div className="center">
        <button className="more lg">더보기</button>
      </div>
    </div>
  );
}
