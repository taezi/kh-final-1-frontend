// src/components/CafeViewPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "../../css/CafePage.css"; // 공통 스타일
import "../../css/CafeViewPage.css"; // 상세 페이지 스타일
import { getCafeInfo } from "../../service/cafeAPI"; // 레스토랑 정보 API
import { addBookmark, getBookmarks, removeBookmark } from "../../service/bookmarkAPI";
import useAuthStore from "../../store/authStore";
import "../../css/EditorDetailPage.css";


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

// CafeViewPage 컴포넌트
export default function CafeViewPage() {
  // 주소창에서 레스토랑 이름과 지점명, 번호를 가져옵니다.
  const {cafeNo } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const [likes, setLikes] = useState(() => new Set());
  
  // 상태 관리: 데이터를 담을 공간, 로딩 상태, 에러 메시지
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 페이지가 로딩될 때마다 맨 위로 스크롤합니다.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [cafeNo]); // cafeNo가 변경될 때도 스크롤하도록 추가

  // 컴포넌트가 처음 렌더링되거나 URL 파라미터가 변경될 때마다 API를 호출합니다.
  useEffect(() => {
    // 비동기 작업 중 페이지 이동을 방지하기 위한 플래그
    let alive = true;
    
    (async () => {
      try {
        setLoading(true); // 로딩 시작
        // cafeNo를 사용하여 상세 정보를 가져옵니다.
        const raw = await getCafeInfo({ cafeNo: Number(cafeNo) }); // cafeNo로 API 호출
        
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
  }, [cafeNo]); // cafeNo가 변경될 때만 API를 호출하도록 의존성 배열 수정

  // 마운트 시 서버에서 좋아요 데이터 가져오기
  useEffect(() => {
    if (!currentUser) return;

    getBookmarks(currentUser.userno, "cafe") // "place"를 "cafes"로 수정
      .then((list) => {
        const cafeLikes = list
          .filter((b) => b.contenttype === "cafe") // "place"를 "cafes"로 수정
          .map((b) => Number(b.contentno));
        setLikes(new Set(cafeLikes));
      })
      .catch((err) => console.error("북마크 불러오기 실패:", err));
  }, [currentUser]);

  // 북마크 좋아요 토글
  const toggleLike = async (cafeNo, e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    const bookmarkData = {
      userno: currentUser.userno,
      contentno: cafeNo,
      contenttype: "cafe", // "place"를 "cafes"로 수정
    };

    const currentlyLiked = likes.has(cafeNo); // 이전 상태 저장

    try {
      // 서버 호출
      if (currentlyLiked) {
        await removeBookmark(bookmarkData);
      } else {
        await addBookmark(bookmarkData);
      }

      // 상태 업데이트
      setLikes(prev => {
        const newSet = new Set(prev);
        currentlyLiked ? newSet.delete(cafeNo) : newSet.add(cafeNo);
        return newSet;
      });
    } catch (err) {
      console.error(err);
      alert("좋아요 처리에 실패했습니다.");
    }
  };
  
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
          <Link to="/cafes" className="cv-btn">
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

      <h1 className="cv-title center">{data.cafeName} {data.cafeBranch} 
         <button
        className={`hearts editor-detail-hearts ${likes.has(data.cafeNo) ? "is-on" : ""}`}
        onClick={(e) => {
          e.stopPropagation(); // 카드 클릭 이벤트와 겹치지 않도록
          toggleLike(data.cafeNo, e); // data.cafeNo를 인자로 전달
        }}
        title="좋아요"
      >
        ♡
      </button>
      
</h1>

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