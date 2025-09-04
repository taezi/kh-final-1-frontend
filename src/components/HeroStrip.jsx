// src/components/HeroStrip.jsx
import React from "react";
// ✅ 경로를 css 폴더 기준으로 수정
import "../css/HeroStrip.css";

export default function HeroStrip({
  title,
  subtitle,
  kicker,
  imageSrc,
  height = 320,
  align = "left",
  variant = "visitseoul",
}) {
  return (
    <div className="heroStrip-root" style={{ height }}>
      <div className="heroStrip-viewport">
        <img className="heroStrip-img" src={imageSrc} alt="" loading="eager" />
        <div className="heroStrip-grad" />
        <div
          className={[
            "heroStrip-content",
            align === "center" ? "is-center" : "is-left",
            variant === "visitseoul" ? "vs" : "def",
          ].join(" ")}
        >
          {kicker && <div className="heroStrip-kicker">{kicker}</div>}
          <h1 className="heroStrip-title">{title}</h1>
          {subtitle && <p className="heroStrip-sub">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
