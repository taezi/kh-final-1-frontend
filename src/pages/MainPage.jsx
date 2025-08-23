import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import TiltSeoulMap from "../components/TiltSeoulMap";

export default function MainPage() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("");
  const carRef = useRef(null);

  const scroll = (dx) =>
    carRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="page">
      <header className="top">
        <div className="brand">Heil Hitler</div>
        <nav className="menu">
          <Link to="/">플레이스</Link>
          <Link to="/pg24">추천</Link>
          <span className="pill">32.7℃</span>
          <Link to="/login">로그인</Link>
          <button onClick={() => dispatch(logout())}>로그아웃</button>
        </nav>
      </header>

      <div className="hero" />

      <section className="section">
        <div className="carousel-head">
          <button className="arrow" onClick={() => scroll(-320)}>
            ‹
          </button>
          <div className="carousel" ref={carRef}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="car-card">
                <div className="thumb" />
                <div className="title">샘플 행사 #{i}</div>
                <div className="meta">서울 어딘가 · 19:00</div>
              </div>
            ))}
          </div>
          <button className="arrow" onClick={() => scroll(320)}>
            ›
          </button>
        </div>
        <div className="center">
          <Link to="/pg24" className="more">
            더 많은 일정 보기
          </Link>
        </div>

        {/* 피그마 톤: 기울기+그라데이션 강 포함 블럭 지도 (25개 전구) */}
        <TiltSeoulMap selected={selected} onSelect={setSelected} />
      </section>
    </div>
  );
}
