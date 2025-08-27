import React, { useMemo, useState } from "react";

const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const grid = (cur) => {
  const s = startOfMonth(cur),
    e = endOfMonth(cur),
    arr = Array.from({ length: s.getDay() }, () => null);
  for (let i = 1; i <= e.getDate(); i++)
    arr.push(new Date(cur.getFullYear(), cur.getMonth(), i));
  while (arr.length < 42) arr.push(null);
  return arr;
};

export default function CalendarWithEvents({
  eventsByDate,
  selectedDistrict,
  selectedDate,
  onSelectDate,
}) {
  const [cur, setCur] = useState(() => selectedDate || new Date());
  const cells = useMemo(() => grid(cur), [cur]);

  const hasEvent = (date) => {
    if (!date) return false;
    const list = eventsByDate[ymd(date)] || [];
    return selectedDistrict
      ? list.some((e) => e.district === selectedDistrict)
      : list.length > 0;
  };

  const isSelected = (date) => {
    if (!selectedDate || !date) return false;
    return ymd(date) === ymd(selectedDate);
  };

  return (
    <div className="cal-card">
      <div className="cal-head">
        <strong>
          {cur.getFullYear()}년 {cur.getMonth() + 1}월
        </strong>
        <div className="cal-nav">
          <button
            onClick={() =>
              setCur((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
          >
            이전
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setCur(new Date(now.getFullYear(), now.getMonth(), 1));
              onSelectDate?.(now);
            }}
          >
            오늘
          </button>
          <button
            onClick={() =>
              setCur((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
          >
            다음
          </button>
        </div>
      </div>

      <div className="cal-week">
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <div key={w} className="cal-w">
            {w}
          </div>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((date, i) => {
          const label = date ? date.getDate() : "";
          const inMonth = date && date.getMonth() === cur.getMonth();
          const dot = hasEvent(date);
          return (
            <button
              key={i}
              disabled={!date}
              onClick={() => date && onSelectDate?.(date)}
              className={`cal-cell ${inMonth ? "" : "is-dim"} ${
                isSelected(date) ? "is-selected" : ""
              }`}
            >
              <div>{label}</div>
              {dot && <div className="cal-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
