// src/components/CafeListItem.js
import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa'; // 하트 아이콘을 위한 라이브러리 임포트
import './CafePage.css'; // 스타일 파일 임포트

// 개별 카페 정보를 표시하는 컴포넌트
function CafeListItem({ cafe }) {
    // 하트 아이콘의 활성화/비활성화 상태를 관리하는 state
    const [isLiked, setIsLiked] = useState(false);

    // 하트 아이콘 클릭 시 호출될 함수
    const handleLikeClick = () => {
        // isLiked 상태를 반전시킴
        setIsLiked(!isLiked);
    };

    // 폰트가 없는 경우를 위한 대체 이미지 경로
    const fallbackImage = 'https://via.placeholder.com/200';

    return (
        // 카페 항목 컨테이너
        <div className="cafe-list-item">
            {/* 카페 이미지를 표시 */}
            {/* cafe.cafeImgAddress가 유효하지 않으면 fallbackImage를 사용 */}
            <img src={cafe.cafeImgAddress || fallbackImage} alt={cafe.cafeName} />
            {/* 카페 정보 컨테이너 */}
            <div className="cafe-info-box">
                {/* 카페 이름과 지점명 */}
                <span className="cafe-name-branch">
                    {cafe.cafeName} {cafe.cafeBranch}
                </span>
                {/* 하트 아이콘 */}
                {/* isLiked 상태에 따라 색상 변경 */}
                <FaHeart
                    className={`heart-icon ${isLiked ? 'liked' : ''}`}
                    onClick={handleLikeClick}
                />
            </div>
        </div>
    );
}

export default CafeListItem;