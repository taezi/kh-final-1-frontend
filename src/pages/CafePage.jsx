import Layout from "../components/Layout";
import { useEffect, useState } from "react";

export default function CafePage() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch("http://localhost:9999/api/weather/now")
      .then((res) => res.json())
      .then((data) => {
        const items = data.response.body.items.item;

        // 기온
        const temp = items.find((i) => i.category === "T1H")?.obsrValue;

        // 강수형태
        const pty = items.find((i) => i.category === "PTY")?.obsrValue;

        // 하늘상태 (SKY가 없으면 PTY로 판단)
        // PTY가 0이면 SKY 값 사용 가능, 아니면 비/눈 상태
        const skyCategory =
          items.find((i) => i.category === "SKY")?.obsrValue || null;
        let sky;
        if (pty === 0) {
          sky = skyCategory; // 맑음/구름/흐림
        } else {
          // 강수 형태가 있으면 하늘상태 대신 비/눈 표시
          // SKY 맵은 그대로 두고, 화면에서는 PTY로 표현
          sky = null;
        }

        setWeather({ temp, pty, sky });
      })
      .catch((err) => {
        console.error("날씨 가져오기 실패", err);
      });
  }, []);

  if (!weather) return <div>날씨 불러오는 중...</div>;

  const skyMap = { 1: "맑음", 3: "구름많음", 4: "흐림" };
  const ptyMap = {
    0: "없음",
    1: "비",
    2: "비/눈",
    3: "눈",
    5: "빗방울",
    6: "빗방울/눈날림",
    7: "눈날림",
  };

  return (
    <Layout>
      <h3>카페페이지</h3>
      <div>
        <h3>서울 실시간 날씨</h3>
        <p>🌡 기온: {weather.temp} ℃</p>
        <p>☔ 강수형태: {ptyMap[weather.pty]}</p>
        {weather.sky !== null && <p>☁ 하늘상태: {skyMap[weather.sky]}</p>}
      </div>
    </Layout>
  );
}
