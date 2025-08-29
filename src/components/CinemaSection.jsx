import React, { useEffect, useRef } from 'react';

export default function CinemaSection({ allRegions = [], cinemas = [], selectedRegion, onRegionChange, error }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef([]);

  // useEffect 훅을 두 개로 분리하여 역할 명확화
  // 첫 번째 useEffect: 지도 인스턴스 초기화
  useEffect(() => {
    // 에러 상태일 경우 지도를 생성하지 않음
    if (error) {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
      return;
    }

    // 이미 지도 인스턴스가 있다면 새로 생성하지 않음
    if (mapInstance.current) return; 

    // 네이버 지도 스크립트가 로드되었는지 확인
    if (window.naver && window.naver.maps) {
      const initialCenter = new window.naver.maps.LatLng(37.5665, 126.9780);
      const mapOptions = {
        center: initialCenter,
        zoom: 12,
        draggable: true,
      };

      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstance.current = map;
    }
  }, [error]); // error 상태가 변경될 때마다 실행


  // useEffect: cinemas 데이터 변경 시 마커 업데이트
  useEffect(() => {
    // 에러 상태이거나 지도가 없으면 실행하지 않음
    if (error || !mapInstance.current) return;

    // 기존 마커 모두 제거
    markerInstance.current.forEach(marker => marker.setMap(null));
    markerInstance.current = [];

    if (cinemas.length > 0) {
      const newMarkers = cinemas.map(cinema => {
        return new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(cinema.latitude, cinema.longitude),
          map: mapInstance.current,
          title: cinema.name
        });
      });
      markerInstance.current = newMarkers;

      const centerLat = cinemas[0].latitude;
      const centerLng = cinemas[0].longitude;
      mapInstance.current.setCenter(new window.naver.maps.LatLng(centerLat, centerLng));
    }
  }, [cinemas, error]);

  // 렌더링 부분 수정
  if (error) {
    return (
      <div className="cinema-section">
        <h2 className="section-title">지역별 상영관</h2>
        <div className="error-message">상영관 데이터를 불러오는 데 실패했습니다.</div>
      </div>
    );
  }

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
        {!mapInstance.current && <p>지도 데이터를 불러오는 중...</p>}
        {cinemas.length === 0 && selectedRegion && (
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