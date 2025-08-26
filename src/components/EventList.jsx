// src/components/EventList.jsx
import React from "react";

export default function EventList({ events, selectedDistrict }) {
  // selectedDistrict === "전체" 또는 빈 값이면 전체 노출
  const shouldFilter =
    selectedDistrict &&
    selectedDistrict !== "전체" &&
    selectedDistrict.trim() !== "";

  const list = shouldFilter
    ? (events || []).filter((e) => (e.gu || e.district) === selectedDistrict)
    : events || [];

  if (list.length === 0) return <div className="empty">행사가 없습니다.</div>;

  return (
    <div className="ev-grid">
      {list.map((e) => (
        <article key={e.id} className="ev-card">
          <div
            className="thumb"
            style={{
              aspectRatio: "3/4",
              backgroundImage: `url(${
                e.thumbUrl ||
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="title">{e.title}</div>
          <div className="meta">
            {/* place가 주소/장소, gu는 자치구 */}
            {e.place || e.address} · {e.gu || e.district || "-"} ·{" "}
            {e.time || ""}
          </div>
        </article>
      ))}
    </div>
  );
}
