// src/components/CafeList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CafeList.css'; // 원하는 스타일을 적용하기 위한 CSS 파일

function CafeList() {
  // API에서 가져온 카페 목록을 저장할 상태
  const [cafes, setCafes] = useState([]);
  // 데이터 로딩 상태를 관리
  const [loading, setLoading] = useState(true);
  // 에러 상태를 관리
  const [error, setError] = useState(null);

  // 컴포넌트가 처음 렌더링될 때 한 번만 API를 호출
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        // 백엔드 API 엔드포인트에 GET 요청을 보냅니다.
        // 프록시 설정 덕분에 'http://localhost:8080'을 생략하고 '/api/cafe/region'만 사용
        const response = await axios.get('/api/cafe/search', {
          params: { region: '강남구' }
        });
        
        // 성공적으로 데이터를 받아오면 상태에 저장
        setCafes(response.data);
      } catch (err) {
        // 에러 발생 시 에러 상태를 업데이트
        setError(err);
      } finally {
        // 로딩 상태를 해제
        setLoading(false);
      }
    };

    fetchCafes();
  }, []); // 의존성 배열이 비어있어 컴포넌트가 마운트될 때 한 번만 실행

  // 로딩 중일 때 표시
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 에러 발생 시 표시
  if (error) {
    return <div>오류가 발생했습니다: {error.message}</div>;
  }

  return (
    <div className="cafe-list-container">
      <h2>강남구 카페 목록</h2>
      <div className="cafe-grid">
        {/* 받아온 카페 데이터를 순회하며 화면에 표시 */}
        {cafes.map(cafe => (
          <div key={cafe.cafeNo} className="cafe-item">
            <img src={cafe.cafeImgAddress} alt={cafe.cafeName} />
            <h3>{cafe.cafeName} {cafe.cafeBranch}</h3>
            <p>{cafe.cafeAddress}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CafeList;