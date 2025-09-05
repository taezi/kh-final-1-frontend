// src/components/CafeViewPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../css/CulturePage.css"; // 공통 스타일
import "../../css/CultureViewPage.css"; // 상세 페이지 스타일
import { getCafeInfo } from "../../service/cafeAPI"; // 레스토랑 정보 API

// 정보 항목을 간결하게 표시하는 작은 컴포넌트
const InfoItem = ({ label, value }) => {
  // value(값)가 있을 때만 항목을 보여줍니다.
  if (!value) return null;
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  );
};

// cafeViewPage 컴포넌트 (파일 이름과 일치하도록 수정)
export default function CafeViewPage() {
  // 주소창에서 레스토랑 이름과 지점명을 가져옵니다.
  const { cafeName, cafeBranch } = useParams();
  
  // 상태 관리: 데이터를 담을 공간, 로딩 상태, 에러 메시지
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 페이지가 로딩될 때마다 맨 위로 스크롤합니다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [cafeName, cafeBranch]);

  // 컴포넌트가 처음 렌더링되거나 cafeName/cafeBranch가 변경될 때마다 API를 호출합니다.
  useEffect(() => {
    // 비동기 작업 중 페이지 이동을 방지하기 위한 플래그
    let alive = true;
    
    (async () => {
      try {
        setLoading(true); // 로딩 시작
        // 레스토랑 정보를 API에서 무조건 가져옵니다.
        const raw = await getCafeInfo({ cafeName, cafeBranch });
        
        if (!alive) return; // 페이지를 벗어났으면 아무것도 하지 않습니다.
        
        setData(raw); // 데이터를 상태에 저장
        setError(""); // 에러 초기화
      } catch (e) {
        if (!alive) return;
        console.error("Failed to fetch cafe info:", e); // 에러 로그
        setError("상세 정보를 불러오지 못했어요."); // 에러 메시지 설정
      } finally {
        if (alive) setLoading(false); // 로딩 종료
      }
    })();
    
    // 컴포넌트가 사라질 때 실행될 정리 함수
    return () => {
      alive = false;
    };
  }, [cafeName, cafeBranch]);

  // 이미지 URL을 메모리에 저장 (한 번만 계산)
  const imgs = useMemo(() => {
    const thumbUrl = data?.cafeImgAddress || "https://picsum.photos/1200/800?blur=2";
    return [thumbUrl];
  }, [data]);

  // 로딩 중일 때 보여줄 화면
  if (loading) {
    return (
      <div className="page cv-wrap">
        <div className="cv-skel hero" />
        <div className="cv-skel text" />
      </div>
    );
  }

  // 에러가 있거나 데이터가 없을 때 보여줄 화면
  if (error || !data) {
    return (
      <div className="page cv-wrap">
        <p className="cv-error">{error || "데이터가 없습니다."}</p>
        <div className="cv-footnav">
          <Link to="/cafe" className="cv-btn">
            목록으로
          </Link>
        </div>
      </div>
    );
  }

  // 데이터가 성공적으로 로딩되었을 때 보여줄 화면
  return (
    <div className="page cv-wrap">
      <div className="cv-topline center">
        {data.cafeName && <span className="cv-chip">{data.cafeName}</span>}
        {data.cafeBranch && <span className="cv-chip">{data.cafeBranch}</span>}
      </div>

      <h1 className="cv-title center">{data.cafeName} {data.cafeBranch}</h1>

      <div className="cv-heroimg">
        <img src={imgs[0]} alt={data.cafeName} />
      </div>

      <section className="cv-card">
        <dl className="cv-dl">
          <InfoItem label="주소" value={data.cafeAddress} />
          <InfoItem label="전화번호" value={data.cafePhonNumber} />
          <InfoItem label="종류" value={data.cafeType} />
          <InfoItem label="영업 시간" value={data.cafeOpen} />
          <InfoItem label="지역" value={data.cafeRegion} />
          <InfoItem label="평점" value={data.cafeRating} />

          {/* 웹사이트 URL (링크로 표시) */}
          {data.cafeWebsite && (
            <>
              <dt>웹사이트</dt>
              <dd>
                <a
                  className="cv-link"
                  href={data.cafeWebsite}
                  target="_blank"
                  rel="noreferrer"
                >
                  {data.cafeWebsite}
                </a>
              </dd>
            </>
          )}

          {/* 지도 URL (지도 임베드로 표시) */}
          {data.cafeMapUrl && (
            <>
              <dt>지도</dt>
              <dd>
                <div className="cv-mapbox">
                  <iframe
                    title="cafe-map"
                    src={data.cafeMapUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                  ></iframe>
                </div>
              </dd>
            </>
          )}
        </dl>
      </section>

      {/* 목록으로 돌아가는 버튼 */}
      <div className="cv-footnav">
        <Link to="/cafes" className="cv-btn">
          목록으로
        </Link>
      </div>
    </div>
  );
}