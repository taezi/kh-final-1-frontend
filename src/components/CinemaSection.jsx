import React, { useEffect, useRef } from 'react';

export default function CinemaSection({ allRegions = [], cinemas = [], selectedRegion, onRegionChange, error }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerInstance = useRef([]);

    // 이 useEffect 훅은 지도가 렌더링될 때 딱 한 번만 실행됩니다.
    // window.kakao.maps.load()를 사용하여 API가 완전히 준비되었을 때만 지도 인스턴스를 생성합니다.
    useEffect(() => {
        // window.kakao와 지도를 담을 div 요소가 모두 존재할 때만 실행
        if (window.kakao && window.kakao.maps && mapRef.current) {
            window.kakao.maps.load(() => {
                // 지도 인스턴스가 없을 때만 생성
                if (!mapInstance.current) {
                    console.log('카카오맵 스크립트 로드 완료, 지도 인스턴스 생성');
                    const initialCenter = new window.kakao.maps.LatLng(37.5665, 126.9780);
                    const mapOptions = {
                        center: initialCenter,
                        level: 4,
                    };
                    const map = new window.kakao.maps.Map(mapRef.current, mapOptions);
                    mapInstance.current = map;
                }
            });
        }
    }, []); // 의존성 배열이 비어 있어 컴포넌트 마운트 시 한 번만 실행

    // 이 useEffect 훅은 cinemas 데이터가 변경될 때마다 실행됩니다.
    // 이미 생성된 지도 인스턴스에 마커를 추가하거나 업데이트하는 역할만 합니다.
    useEffect(() => {
        // 지도 인스턴스가 존재하고 cinemas 데이터가 있을 때만 실행
        if (mapInstance.current && window.kakao && window.kakao.maps) {
            // 기존 마커 제거
            markerInstance.current.forEach(marker => marker.setMap(null));
            markerInstance.current = [];
            
            // 새로운 마커 추가
            if (cinemas.length > 0) {
                const bounds = new window.kakao.maps.LatLngBounds();
                const newMarkers = cinemas.map(cinema => {
                    const position = new window.kakao.maps.LatLng(cinema.x, cinema.y);
                    bounds.extend(position);
                    return new window.kakao.maps.Marker({
                        position: position,
                        map: mapInstance.current,
                        title: cinema.name
                    });
                });
                markerInstance.current = newMarkers;
                mapInstance.current.setBounds(bounds);
            }
        }
    }, [cinemas]);

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
                {(!window.kakao || !window.kakao.maps) && <p className="map-message">지도 스크립트를 불러오는 중...</p>}
                {(window.kakao && window.kakao.maps && cinemas.length === 0) && (
                    <p className="map-message">선택된 지역에 상영관이 없습니다.</p>
                )}
            </div>

            <div className="cinema-list">
                {cinemas.map((cinema, index) => (
                    <div key={cinema.name + cinema.address + index} className="cinema-item">
                        <h3>{cinema.name}</h3>
                        <p>{cinema.address}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
