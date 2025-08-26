// src/components/TiltSeoulMap.jsx
import React, { useLayoutEffect, useState } from "react";

/** 서울 25개 자치구 블럭 지도 (정돈형, 베이지 톤) */
const STAGE_RATIO = 56;
const RIVER_Y = 60; // 한강 위치(%)
const SAFE = 6.5; // 강과의 안전거리(%)
const SPACING = 1.6; // 블럭 간 최소 간격(%)
const BOUNDS = { padX: 3, top: 6, bottom: 6 };
const MAX_ITER = 240;

const W = 9.6; // 기본 폭(%)
const H = 7.2; // 기본 높이(%)

// --- 좌표 레이아웃 (겹침 최소 + 균형 잡힌 배치) ---
const BASE = [
  // 북측
  {
    id: "eunpyeong",
    label: "은평구",
    side: "N",
    x: 20,
    y: 28,
    w: W,
    h: H,
    rot: -6,
  },
  {
    id: "seodaemun",
    label: "서대문구",
    side: "N",
    x: 30,
    y: 32,
    w: W,
    h: H,
    rot: -4,
  },
  { id: "mapo", label: "마포구", side: "N", x: 20, y: 40, w: W, h: H, rot: -5 },

  {
    id: "jongno",
    label: "종로구",
    side: "N",
    x: 44,
    y: 30,
    w: W,
    h: H,
    rot: -2,
  },
  { id: "jung", label: "중구", side: "N", x: 48, y: 38, w: W, h: H, rot: +2 },
  {
    id: "yongsan",
    label: "용산구",
    side: "N",
    x: 36,
    y: 45,
    w: W,
    h: H,
    rot: +3,
  },

  {
    id: "ddm",
    label: "동대문구",
    side: "N",
    x: 61,
    y: 33,
    w: W,
    h: H,
    rot: +4,
  },
  {
    id: "seongdong",
    label: "성동구",
    side: "N",
    x: 57,
    y: 42,
    w: W,
    h: H,
    rot: +3,
  },
  {
    id: "gwangjin",
    label: "광진구",
    side: "N",
    x: 68,
    y: 45,
    w: W,
    h: H,
    rot: +2,
  },

  {
    id: "seongbuk",
    label: "성북구",
    side: "N",
    x: 72,
    y: 30,
    w: W,
    h: H,
    rot: -2,
  },
  {
    id: "gangbuk",
    label: "강북구",
    side: "N",
    x: 78,
    y: 24,
    w: W,
    h: H,
    rot: -3,
  },
  {
    id: "jungnang",
    label: "중랑구",
    side: "N",
    x: 82,
    y: 36,
    w: W,
    h: H,
    rot: -4,
  },
  {
    id: "dobong",
    label: "도봉구",
    side: "N",
    x: 90,
    y: 26,
    w: W,
    h: H,
    rot: -2,
  },
  {
    id: "nowon",
    label: "노원구",
    side: "N",
    x: 94,
    y: 33,
    w: W,
    h: H,
    rot: -2,
  },

  // 남측
  {
    id: "gangseo",
    label: "강서구",
    side: "S",
    x: 14,
    y: 76,
    w: 11.2,
    h: 8.2,
    rot: -5,
  },
  {
    id: "yangcheon",
    label: "양천구",
    side: "S",
    x: 26,
    y: 76,
    w: W,
    h: H,
    rot: -3,
  },
  {
    id: "ydp",
    label: "영등포구",
    side: "S",
    x: 34,
    y: 78,
    w: W,
    h: H,
    rot: -3,
  },

  { id: "guro", label: "구로구", side: "S", x: 19, y: 86, w: W, h: H, rot: +2 },
  {
    id: "geumcheon",
    label: "금천구",
    side: "S",
    x: 28,
    y: 88,
    w: W,
    h: H,
    rot: -2,
  },
  {
    id: "dongjak",
    label: "동작구",
    side: "S",
    x: 44,
    y: 84,
    w: W,
    h: H,
    rot: +1,
  },
  {
    id: "gwanak",
    label: "관악구",
    side: "S",
    x: 35,
    y: 86,
    w: W,
    h: H,
    rot: -4,
  },

  {
    id: "seocho",
    label: "서초구",
    side: "S",
    x: 48,
    y: 74,
    w: 10.8,
    h: 8.0,
    rot: +5,
  },
  {
    id: "gangnam",
    label: "강남구",
    side: "S",
    x: 62,
    y: 72,
    w: 14.4,
    h: 9.2,
    rot: -4,
  },
  {
    id: "songpa",
    label: "송파구",
    side: "S",
    x: 74,
    y: 76,
    w: W,
    h: H,
    rot: +4,
  },
  {
    id: "gangdong",
    label: "강동구",
    side: "S",
    x: 90,
    y: 78,
    w: 11.2,
    h: 8.2,
    rot: -4,
  },
];

const RIVER_PATH = "M 0 60 C 20 56, 47 63, 72 58 S 98 56, 100 60";

const ratio = STAGE_RATIO / 100;
const toWU_Y = (y) => y * ratio;
const fromWU_Y = (wy) => wy / ratio;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function halfExtentsWU(w, h, rotDeg) {
  const rad = (Math.abs(rotDeg) * Math.PI) / 180;
  const cos = Math.cos(rad),
    sin = Math.sin(rad);
  const hw = w / 2,
    hh = toWU_Y(h) / 2;
  return {
    hx: Math.abs(cos) * hw + Math.abs(sin) * hh,
    hy: Math.abs(sin) * hw + Math.abs(cos) * hh,
  };
}
function penetration(a, b) {
  const ax = a.x,
    ay = toWU_Y(a.y);
  const bx = b.x,
    by = toWU_Y(b.y);
  const A = halfExtentsWU(a.w, a.h, a.rot);
  const B = halfExtentsWU(b.w, b.h, b.rot);
  const dx = ax - bx,
    dy = ay - by;
  const ox = A.hx + B.hx + SPACING - Math.abs(dx);
  const oy = A.hy + B.hy + SPACING - Math.abs(dy);
  if (ox <= 0 || oy <= 0) return null;

  const preferY = a.side !== b.side ? true : oy < ox;
  if (preferY) {
    const push = oy / 2;
    const dir = dy >= 0 ? +1 : -1;
    let ayPush = dir * push,
      byPush = -dir * push;
    if (a.side !== b.side) {
      ayPush = a.side === "N" ? -oy : +oy;
      byPush = b.side === "N" ? -oy : +oy;
    }
    return { ax: 0, ay: ayPush, bx: 0, by: byPush };
  } else {
    const push = ox / 2;
    const dir = dx >= 0 ? +1 : -1;
    return { ax: dir * push, ay: 0, bx: -dir * push, by: 0 };
  }
}

function resolve(init) {
  const arr = init.map((o) => ({ ...o }));
  for (let it = 0; it < MAX_ITER; it++) {
    let moved = 0;

    // 경계/강 안전거리 클램핑
    for (const a of arr) {
      const minX = BOUNDS.padX + a.w / 2;
      const maxX = 100 - BOUNDS.padX - a.w / 2;
      const minY =
        a.side === "N" ? BOUNDS.top + a.h / 2 : RIVER_Y + SAFE + a.h / 2;
      const maxY =
        a.side === "N"
          ? RIVER_Y - SAFE - a.h / 2
          : 100 - BOUNDS.bottom - a.h / 2;
      const nx = clamp(a.x, minX, maxX);
      const ny = clamp(a.y, minY, maxY);
      moved += Math.abs(nx - a.x) + Math.abs(ny - a.y);
      a.x = nx;
      a.y = ny;
    }

    // 쌍별 충돌 해소
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i],
          b = arr[j];
        const p = penetration(a, b);
        if (!p) continue;
        a.x += p.ax * 0.85;
        a.y += fromWU_Y(p.ay) * 0.85;
        b.x += p.bx * 0.85;
        b.y += fromWU_Y(p.by) * 0.85;

        for (const k of [a, b]) {
          const minX = BOUNDS.padX + k.w / 2;
          const maxX = 100 - BOUNDS.padX - k.w / 2;
          const minY =
            k.side === "N" ? BOUNDS.top + k.h / 2 : RIVER_Y + SAFE + k.h / 2;
          const maxY =
            k.side === "N"
              ? RIVER_Y - SAFE - k.h / 2
              : 100 - BOUNDS.bottom - k.h / 2;
          const nx = clamp(k.x, minX, maxX);
          const ny = clamp(k.y, minY, maxY);
          moved += Math.abs(nx - k.x) + Math.abs(ny - k.y);
          k.x = nx;
          k.y = ny;
        }
      }
    }

    if (moved < 0.015) break;
  }
  return arr;
}

export default function TiltSeoulMap({ selectedGu, onSelectGu }) {
  const [layout, setLayout] = useState(() => resolve(BASE));
  useLayoutEffect(() => {
    setLayout(resolve(BASE));
  }, []);

  return (
    <div className="ts-abs" style={{ paddingBottom: `${STAGE_RATIO}%` }}>
      {/* 강 */}
      <svg
        className="ts-river-abs"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9ed7ff" />
            <stop offset="1" stopColor="#6ec1ff" />
          </linearGradient>
        </defs>
        <path
          d={RIVER_PATH}
          fill="none"
          stroke="url(#riverGrad)"
          strokeWidth="4.0"
          strokeLinecap="round"
        />
        <path
          d={RIVER_PATH}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.22"
          strokeWidth="1.0"
          strokeLinecap="round"
        />
      </svg>

      {/* 블럭 */}
      {layout.map((b) => {
        const active = selectedGu === b.label;
        const style = {
          left: `${b.x}%`,
          top: `${b.y}%`,
          width: `${b.w}%`,
          height: `${b.h}%`,
          transform: `translate(-50%, -50%) rotate(${b.rot}deg)`,
        };
        return (
          <button
            key={b.id}
            className={`ts-block ts-block-abs ${active ? "is-selected" : ""}`}
            style={style}
            onClick={() => onSelectGu?.(active ? "" : b.label)}
            aria-pressed={active}
            title={b.label}
          >
            <span
              className="label"
              style={{ transform: `rotate(${-b.rot}deg)` }}
            >
              {b.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
