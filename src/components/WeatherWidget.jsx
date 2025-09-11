import React, { useEffect, useMemo, useState } from "react";
import "../css/WeatherWidget.css";

function skyText(pty, sky) {
  if (pty && pty !== "0") {
    switch (pty) {
      case "1":
        return "비";
      case "2":
        return "비/눈";
      case "3":
        return "눈";
      case "4":
        return "소나기";
      default:
        return "강수";
    }
  }
  switch (sky) {
    case "1":
      return "맑음";
    case "3":
      return "구름많음";
    case "4":
      return "흐림";
    default:
      return "알수없음";
  }
}

// 간단 아이콘
function skyIcon(pty, sky) {
  if (pty && pty !== "0") return "🌧️";
  if (sky === "1") return "☀️";
  if (sky === "3") return "⛅";
  if (sky === "4") return "☁️";
  return "🌡️";
}

// 미세먼지 등급
function getDustGrade(value) {
  if (value <= 30) return { label: "좋음", grade: "good" };
  if (value <= 80) return { label: "보통", grade: "normal" };
  if (value <= 150) return { label: "나쁨", grade: "bad" };
  return { label: "매우나쁨", grade: "very-bad" };
}

export default function WeatherWidget({ gu: propGu }) {
  const [gu, setGu] = useState(propGu);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const title = useMemo(() => `서울특별시 ${gu} 현재 날씨`, [gu]);

  useEffect(() => {
    setGu(propGu);
  }, [propGu]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/weather/future?gu=${encodeURIComponent(gu)}`)
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
        setData(json);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [gu]);

  if (loading)
    return <div className="weather-card">날씨를 불러오는중입니다...</div>;
  if (!data || data.error)
    return <div className="weather-card">날씨 정보를 가져오지 못했습니다.</div>;

  const cur = data.current || {};
  const curText = skyText(cur.pty, cur.sky);
  const curIcon = skyIcon(cur.pty, cur.sky);

  // 미세먼지 등급 계산
  const pm10Grade = getDustGrade(data.pm10 || 0);
  const pm25Grade = getDustGrade(data.pm25 || 0);

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h2>{title}</h2>
      </div>

      <div className="weather-main">
        <div className="icon">{curIcon}</div>
        <div className="weather-info">
          <div className="temp">{cur.temp ? `${cur.temp}°` : "-"}</div>
          <div className="desc">{curText}</div>
        </div>

        {/* 미세먼지 / 초미세먼지 */}
        <div className={`dust-box ${pm10Grade.grade}`}>
          미세먼지: {data.pm10}㎍/㎥ ({pm10Grade.label})
        </div>
        <div className={`dust-box ${pm25Grade.grade}`}>
          초미세먼지: {data.pm25}㎍/㎥ ({pm25Grade.label})
        </div>
      </div>

      <div className="weather-days">
        {Array.isArray(data.days) &&
          data.days.map((d) => {
            const amText = skyText(d?.am?.pty, d?.am?.sky);
            const pmText = skyText(d?.pm?.pty, d?.pm?.sky);
            const amIcon = skyIcon(d?.am?.pty, d?.am?.sky);
            const pmIcon = skyIcon(d?.pm?.pty, d?.pm?.sky);
            return (
              <div className="day" key={d.date}>
                <div className="label">{d.label}</div>
                <div className="half">
                  <div className="half-title">오전</div>
                  <div className="half-icon">{amIcon}</div>
                  <div className="half-temp">
                    {d?.am?.temp ? `${d.am.temp}°` : "-"}
                  </div>
                  <div className="half-desc">{amText}</div>
                </div>
                <div className="half">
                  <div className="half-title">오후</div>
                  <div className="half-icon">{pmIcon}</div>
                  <div className="half-temp">
                    {d?.pm?.temp ? `${d.pm.temp}°` : "-"}
                  </div>
                  <div className="half-desc">{pmText}</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
