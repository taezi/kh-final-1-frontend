import React, { useEffect, useRef, useState } from 'react';

// 네이버 지도 API 키를 여기에 직접 선언
const NCP_KEY_ID = "Xdy0nX4rvj4mCo7BTp3H";
const NAVER_MAPS_SCRIPT_URL = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NCP_KEY_ID}`;

// 네이버 지도 스크립트 로딩을 관리하는 커스텀 훅
const useNaverMapsLoader = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.naver && window.naver.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = NAVER_MAPS_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('네이버 지도 스크립트 로드 실패');
      setIsLoaded(false);
    };
    document.head.appendChild(script);

    // 스크립트 로더는 컴포넌트가 언마운트되어도 계속 유지
    return () => {
      // 컴포넌트가 언마운트되더라도 스크립트를 제거하지 않도록 함
      // (다른 컴포넌트에서 또 필요할 수 있기 때문)
    };
  }, []);

  return isLoaded;
};

// allRegions와 cinemas prop에 기본값을 설정하여 오류를 방지
export default function CinemaSection({ allRegions = [], cinemas = [], selectedRegion, onRegionChange }) {
  const isMapLoaded = useNaverMapsLoader();
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // 지도 인스턴스를 저장할 ref
  const markerInstance = useRef([]); // 마커 인스턴스를 저장할 ref

  // 첫 번째 useEffect: 컴포넌트가 처음 마운트될 때 지도를 한 번만 생성
  useEffect(() => {
    // isMapLoaded가 true이고, mapRef가 유효하고, 지도 인스턴스가 아직 없으면
    if (isMapLoaded && mapRef.current && !mapInstance.current) {
      // 초기 중심 좌표 설정 (데이터가 없을 경우 서울 시청)
      const centerLat = cinemas[0]?.latitude || 37.5665;
      const centerLng = cinemas[0]?.longitude || 126.9780;
      
      const mapOptions = {
        center: new window.naver.maps.LatLng(centerLat, centerLng),
        zoom: 12,
        // 드래그를 허용하여 사용자가 지도를 직접 움직일 수 있게 함
        draggable: true,
      };
      
      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstance.current = map; // 생성된 지도 인스턴스를 ref에 저장
      
      // 클린업 함수: 컴포넌트가 언마운트될 때 지도 파괴
      return () => {
        if (mapInstance.current) {
          //  오류 방지를 위해 setTimeout으로 파괴 로직을 비동기적으로 실행 
          setTimeout(() => {
            try {
              mapInstance.current.destroy();
            } catch (e) {
              console.error("네이버 지도 인스턴스 파괴 중 오류 발생:", e);
              // 오류가 발생하더라도 애플리케이션이 멈추지 않도록 처리
            } finally {
              mapInstance.current = null; // 인스턴스를 null로 설정해 재사용 방지
            }
          }, 0); // 0ms 지연으로 다음 이벤트 루프 틱에서 실행
        }
      };
    }
  }, [isMapLoaded]); // isMapLoaded가 변경될 때만 실행

  // 두 번째 useEffect: cinemas 데이터가 변경될 때마다 마커를 업데이트
  useEffect(() => {
    if (mapInstance.current && isMapLoaded) {
      // 기존 마커 모두 제거
      markerInstance.current.forEach(marker => {
        marker.setMap(null);
      });
      markerInstance.current = []; // 마커 배열 초기화

      if (cinemas.length > 0) {
        // 새로운 마커 생성 및 배열에 추가
        const newMarkers = cinemas.map(cinema => {
          return new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(cinema.latitude, cinema.longitude),
            map: mapInstance.current,
            title: cinema.name // 마커에 영화관 이름 추가
          });
        });
        markerInstance.current = newMarkers;

        // 지도의 중심을 새로운 영화관 목록의 첫 번째 요소로 이동
        const centerLat = cinemas[0].latitude;
        const centerLng = cinemas[0].longitude;
        mapInstance.current.setCenter(new window.naver.maps.LatLng(centerLat, centerLng));
      }
    }
  }, [cinemas, isMapLoaded]); // cinemas 데이터와 isMapLoaded가 변경될 때만 실행

  return (
    <div className="cinema-section">
      <h2 className="section-title">지역별 상영관</h2>
      <div className="region-selector">
        {allRegions.map(region => (
          <button
            key={region}
            className={`region-button ${selectedRegion === region ? 'active' : ''}`}
            onClick={() => onRegionChange(region)}
          >
            {region}
          </button>
        ))}
      </div>

      <div className="map-container" ref={mapRef}>
        {!isMapLoaded && <p>지도 데이터를 불러오는 중...</p>}
        {isMapLoaded && !mapInstance.current && <p>지도 인스턴스 생성 중...</p>}
        {isMapLoaded && cinemas.length === 0 && selectedRegion && (
          <p>선택된 지역에 상영관이 없습니다.</p>
        )}
      </div>

      <div className="cinema-list">
        {cinemas.map(cinema => (
          <div key={cinema.id} className="cinema-item">
            <h3>{cinema.name}</h3>
            <p>{cinema.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
