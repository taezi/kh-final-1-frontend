// src/components/TiltSeoulMap.jsx
import React, { useLayoutEffect, useState } from "react";

/** 절대좌표 + 회전보정 충돌해소(OBB 근사) + 강 안전선 */
const stageRatio = 60; // 컨테이너 높이 = width * 0.60
const RIVER_Y = 64; // ★ 강 y(%): 살짝 위로 올려 아래 공간 확보
const SAFE = 6; // 강과 최소 간격(%)
const SPACING = 2.2; // 블럭 간 최소 간격(폭 기준 %)
const MAX_ITER = 280;
const BOUNDS = { padX: 3.5, top: 8, bottom: 8 }; // ★ 하단 여백 완화

/* 초기 배치 */
const BASE = [
  // ── 강 위쪽
  { id: "mapo", label: "마포", side: "N", x: 10, y: 33, w: 12, h: 9, rot: -9 },
  {
    id: "sinchon",
    label: "신촌",
    side: "N",
    x: 21,
    y: 31,
    w: 11,
    h: 9,
    rot: -7,
  },
  {
    id: "eunpseodae",
    label: "은평 서대문",
    side: "N",
    x: 30,
    y: 25,
    w: 13,
    h: 9,
    rot: -12,
  },
  {
    id: "jongno",
    label: "종로",
    side: "N",
    x: 45,
    y: 23,
    w: 10,
    h: 9,
    rot: -4,
  },
  {
    id: "daehakro",
    label: "대학로",
    side: "N",
    x: 56,
    y: 25,
    w: 11,
    h: 9,
    rot: 8,
  },
  {
    id: "ddm-sd",
    label: "동대문 성동",
    side: "N",
    x: 66,
    y: 27,
    w: 13,
    h: 9,
    rot: 10,
  },
  {
    id: "gb-sb",
    label: "강북 성북",
    side: "N",
    x: 78,
    y: 24,
    w: 12,
    h: 9,
    rot: -6,
  },
  {
    id: "jn-gj",
    label: "중랑 광진",
    side: "N",
    x: 80,
    y: 31,
    w: 12,
    h: 9,
    rot: -8,
  },
  {
    id: "nw-db",
    label: "노원 도봉 의정부",
    side: "N",
    x: 93,
    y: 28,
    w: 16,
    h: 9,
    rot: -4,
  },

  {
    id: "hongyeon",
    label: "홍대-연남",
    side: "N",
    x: 18,
    y: 40,
    w: 13,
    h: 9,
    rot: -10,
  },
  {
    id: "gwanghwamun",
    label: "광화문",
    side: "N",
    x: 39,
    y: 39,
    w: 12,
    h: 9,
    rot: -2,
  },
  {
    id: "yongsan",
    label: "용산",
    side: "N",
    x: 37,
    y: 44,
    w: 10,
    h: 9,
    rot: 8,
  },
  { id: "myeong", label: "명동", side: "N", x: 47, y: 38, w: 10, h: 9, rot: 2 },
  { id: "junggu", label: "중구", side: "N", x: 50, y: 43, w: 10, h: 9, rot: 6 },
  {
    id: "itaewon",
    label: "이태원",
    side: "N",
    x: 57,
    y: 45,
    w: 11,
    h: 9,
    rot: -10,
  },
  { id: "gundae", label: "건대", side: "N", x: 66, y: 44, w: 10, h: 9, rot: 8 },

  // ── 강 아래쪽(재분산)
  {
    id: "gs-yc-gp",
    label: "강서 양천 김포",
    side: "S",
    x: 14,
    y: 78,
    w: 18,
    h: 10,
    rot: -8,
  },
  {
    id: "ydp",
    label: "영등포",
    side: "S",
    x: 30,
    y: 77,
    w: 12,
    h: 10,
    rot: -6,
  },
  {
    id: "guro",
    label: "구로",
    side: "S",
    x: 16.5,
    y: 86,
    w: 11,
    h: 10,
    rot: 3,
  },
  {
    id: "gwanakL",
    label: "관악",
    side: "S",
    x: 26.8,
    y: 84,
    w: 11,
    h: 10,
    rot: -8,
  },
  {
    id: "gwanakC",
    label: "관악",
    side: "S",
    x: 36.8,
    y: 83,
    w: 11,
    h: 10,
    rot: -6,
  },
  {
    id: "seocho",
    label: "서초",
    side: "S",
    x: 43,
    y: 73,
    w: 12,
    h: 10,
    rot: 10,
  },
  {
    id: "gangnamst",
    label: "강남역",
    side: "S",
    x: 47,
    y: 90,
    w: 12,
    h: 10,
    rot: 8,
  },
  {
    id: "garosu",
    label: "가로수길",
    side: "S",
    x: 57,
    y: 86,
    w: 12,
    h: 10,
    rot: 12,
  },
  {
    id: "gangnam",
    label: "강남구",
    side: "S",
    x: 60,
    y: 74,
    w: 18,
    h: 11,
    rot: -8,
  },
  {
    id: "songpa",
    label: "송파",
    side: "S",
    x: 73,
    y: 76,
    w: 12,
    h: 10,
    rot: 8,
  },
  {
    id: "gdh",
    label: "강동 하남",
    side: "S",
    x: 89,
    y: 79,
    w: 14,
    h: 11,
    rot: -10,
  },
];

const ratio = stageRatio / 100;
const RIVER_PATH = "M 0 64 C 22 60, 49 66, 74 62 S 98 60, 100 64";

const toWU_Y = (y) => y * ratio; // y(% of height) → 폭기준단위
const fromWU_Y = (y) => y / ratio;

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
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function penetration(a, b) {
  const ax = a.x,
    ay = toWU_Y(a.y),
    bx = b.x,
    by = toWU_Y(b.y);
  const A = halfExtentsWU(a.w, a.h, a.rot),
    B = halfExtentsWU(b.w, b.h, b.rot);
  const dx = ax - bx,
    dy = ay - by;
  const ox = A.hx + B.hx + SPACING - Math.abs(dx);
  const oy = A.hy + B.hy + SPACING - Math.abs(dy);
  if (ox <= 0 || oy <= 0) return null;

  let useY = a.side !== b.side ? true : oy < ox;
  if (useY) {
    const push = oy / 2,
      dirA = dy >= 0 ? +1 : -1;
    let ayPush = dirA * push,
      byPush = -dirA * push;
    if (a.side !== b.side) {
      ayPush = a.side === "N" ? -oy : +oy;
      byPush = b.side === "N" ? -oy : +oy;
    }
    return { ax: 0, ay: ayPush, bx: 0, by: byPush };
  } else {
    const push = ox / 2,
      dirA = dx >= 0 ? +1 : -1;
    return { ax: dirA * push, ay: 0, bx: -dirA * push, by: 0 };
  }
}

function resolve(layout) {
  const arr = layout.map((o) => ({ ...o }));
  for (let it = 0; it < MAX_ITER; it++) {
    let moved = 0;
    // 경계/강 안전거리
    for (const a of arr) {
      const minX = BOUNDS.padX + a.w / 2,
        maxX = 100 - BOUNDS.padX - a.w / 2;
      const minY =
        a.side === "N" ? BOUNDS.top + a.h / 2 : RIVER_Y + SAFE + a.h / 2;
      const maxY =
        a.side === "N"
          ? RIVER_Y - SAFE - a.h / 2
          : 100 - BOUNDS.bottom - a.h / 2;
      const nx = clamp(a.x, minX, maxX),
        ny = clamp(a.y, minY, maxY);
      moved += Math.abs(nx - a.x) + Math.abs(ny - a.y);
      a.x = nx;
      a.y = ny;
    }
    // 쌍별 충돌해소
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i],
          b = arr[j],
          p = penetration(a, b);
        if (!p) continue;
        a.x += p.ax;
        a.y += fromWU_Y(p.ay);
        b.x += p.bx;
        b.y += fromWU_Y(p.by);
        for (const k of [a, b]) {
          const minX = BOUNDS.padX + k.w / 2,
            maxX = 100 - BOUNDS.padX - k.w / 2;
          const minY =
            k.side === "N" ? BOUNDS.top + k.h / 2 : RIVER_Y + SAFE + k.h / 2;
          const maxY =
            k.side === "N"
              ? RIVER_Y - SAFE - k.h / 2
              : 100 - BOUNDS.bottom - k.h / 2;
          const nx = clamp(k.x, minX, maxX),
            ny = clamp(k.y, minY, maxY);
          moved += Math.abs(nx - k.x) + Math.abs(ny - k.y);
          k.x = nx;
          k.y = ny;
        }
      }
    }
    if (moved < 0.02) break;
  }
  return arr;
}

export default function TiltSeoulMap({ selected, onSelect }) {
  const [layout, setLayout] = useState(() => resolve(BASE));
  useLayoutEffect(() => {
    setLayout(resolve(BASE));
  }, []);

  return (
    <div className="ts-wrap">
      <div className="ts-title">
        <span className="kr">서울</span>
        <span className="en">seoul</span>
      </div>

      <div className="ts-abs" style={{ paddingBottom: `${stageRatio}%` }}>
        {/* 한강 */}
        <svg
          className="ts-river-abs"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#a7d9ff" />
              <stop offset="1" stopColor="#72c2ff" />
            </linearGradient>
          </defs>
          <path
            d={RIVER_PATH}
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d={RIVER_PATH}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.22"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* 블럭 */}
        {layout.map((b) => {
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
              className={`ts-block ts-block-abs ${
                selected === b.label ? "is-selected" : ""
              }`}
              style={style}
              onClick={() => onSelect?.(selected === b.label ? "" : b.label)}
              aria-pressed={selected === b.label}
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

      <div className="ts-actions">
        <button className="chip" onClick={() => onSelect?.("")}>
          선택 해제
        </button>
      </div>
    </div>
  );
}
