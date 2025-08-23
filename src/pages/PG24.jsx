import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CalendarWithEvents from "../components/CalendarWithEvents";
import EventList from "../components/EventList";

const EVENTS = {
  "2025-08-24": [
    {
      id: "evt-001",
      title: "한강 야외 재즈 콘서트",
      district: "영등포구",
      place: "여의도 한강공원",
      time: "18:30",
    },
    {
      id: "evt-002",
      title: "서울시립미술관 야간개장",
      district: "중구",
      place: "서소문 본관",
      time: "19:00",
    },
  ],
  "2025-08-25": [
    {
      id: "evt-003",
      title: "북촌 전통공예 체험",
      district: "종로구",
      place: "공예체험관",
      time: "14:00",
    },
  ],
};

export default function PG24() {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedKey = useMemo(() => {
    const d = selectedDate,
      y = d.getFullYear(),
      m = String(d.getMonth() + 1).padStart(2, "0"),
      dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }, [selectedDate]);
  const eventsOfDay = EVENTS[selectedKey] || [];

  return (
    <div className="page">
      <header className="top">
        <div className="brand">KH MOVIE</div>
        <nav className="menu">
          <Link to="/">플레이스</Link>
          <Link to="/pg24">추천</Link>
          <span className="pill">32.7℃</span>
          <Link to="/login">로그인</Link>
        </nav>
      </header>

      <div className="hero" />

      <section className="section">
        {/* 좌: 달력 / 우: 타임라인 카드 */}
        <div className="grid24">
          <CalendarWithEvents
            eventsByDate={EVENTS}
            selectedDistrict={selectedDistrict}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
          <div className="agenda-card">
            <div className="agenda-head">{selectedKey} 일정</div>
            <ul className="agenda-list">
              {(eventsOfDay.length
                ? eventsOfDay
                : [{ id: "none", title: "일정 없음" }]
              ).map((e) => (
                <li key={e.id}>
                  <span className="dot" />
                  <span className="txt">
                    {e.title}
                    {e.place ? ` · ${e.place}` : ""}
                    {e.time ? ` · ${e.time}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 구 칩 + 검색 */}
        <div className="toolbar">
          <div className="chips">
            {[
              "강남구",
              "서초구",
              "송파구",
              "강동구",
              "영등포구",
              "마포구",
              "종로구",
              "중구",
            ].map((n) => (
              <button
                key={n}
                className={`chip ${selectedDistrict === n ? "active" : ""}`}
                onClick={() => setSelectedDistrict((d) => (d === n ? "" : n))}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="search">
            <input
              placeholder={`서울특별시 ${selectedDistrict || "전역"} 문화/행사`}
            />
            <button>🔍</button>
          </div>
        </div>

        {/* 하단 카드 그리드 */}
        <EventList events={eventsOfDay} selectedDistrict={selectedDistrict} />
        <div className="center">
          <button className="more lg">더보기</button>
        </div>
      </section>
    </div>
  );
}
