import React from "react";

export default function EventList({ events, selectedDistrict }) {
  const list = selectedDistrict
    ? (events || []).filter((e) => e.district === selectedDistrict)
    : events || [];
  if (list.length === 0) return <div className="empty">행사가 없습니다.</div>;
  return (
    <div className="ev-grid">
      {list.map((e) => (
        <div key={e.id} className="ev-card">
          <div className="thumb" />
          <div className="title">{e.title}</div>
          <div className="meta">
            {e.place} · {e.district} · {e.time}
          </div>
        </div>
      ))}
    </div>
  );
}
