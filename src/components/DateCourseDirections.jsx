// src/components/DateCourseDirections.jsx
import React, { useEffect, useState } from "react";
import { fetchDirectionsUrl } from "../service/mapAPI";

const stripParen = (s = "") =>
  s.replace(/\s*[\(\[（【〔].*?[\)\]）】〔〕]\s*/g, " ").trim();

// ✅ embed URL → 구글 지도(외부) directions 링크로 변환
const toExternalDirUrl = (embedUrl = "") => {
  try {
    const u = new URL(embedUrl);
    const q = u.searchParams;
    const origin = q.get("origin") || "";
    const destination = q.get("destination") || "";
    const waypoints = q.get("waypoints") || "";
    const mode = q.get("mode") || "walking";

    const out = new URL("https://www.google.com/maps/dir/");
    out.searchParams.set("api", "1");
    origin && out.searchParams.set("origin", origin);
    destination && out.searchParams.set("destination", destination);
    waypoints && out.searchParams.set("waypoints", waypoints);
    mode && out.searchParams.set("travelmode", mode);
    return out.toString();
  } catch {
    return "https://maps.google.com";
  }
};

export default function DateCourseDirections({ places = [] }) {
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const addrs = (places || [])
      .map((p) => stripParen(p.address || p.name || ""))
      .filter(Boolean);

    if (addrs.length < 2) {
      setUrl("");
      setErr("");
      return;
    }

    (async () => {
      try {
        setErr("");
        const { url } = await fetchDirectionsUrl(addrs);
        console.log("[embed url]", url);
        setUrl(url);
      } catch (e) {
        console.error(e);
        setErr("지도를 불러오지 못했어요.");
        setUrl("");
      }
    })();
  }, [places]);

  if (!url && !err) return null;

  const externalUrl = toExternalDirUrl(url);

  return (
    <section className="dc-map-list" style={{ marginTop: 28 }}>
      <h2
        className="dc-map-title"
        style={{ fontSize: 18, fontWeight: 800, margin: "0 0 12px" }}
      >
        코스 경로(도보)
      </h2>

      {err ? (
        <p style={{ color: "#d00", fontWeight: 700 }}>{err}</p>
      ) : (
        <>
          {/* ✅ 안내 문구 추가 */}
          <p
            className="dc-map-note"
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            지도의 <strong>‘더보기’</strong> 옵션을 눌러 상세 경로를 확인하세요.{" "}
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 700, textDecoration: "none" }}
            >
              구글 지도에서 크게 보기 ↗
            </a>
          </p>

          <div
            className="dc-map-item"
            style={{
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <div className="dc-map-iframe-wrap" style={{ height: 360 }}>
              <iframe
                title="date-course-directions"
                src={url}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
