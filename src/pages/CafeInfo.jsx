// CafeInfo.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * CafeInfo 컴포넌트는 특정 카페의 상세 정보를 조회합니다.
 * @returns {JSX.Element} 카페 정보 조회 UI
 */
const CafeInfo = () => {
    // API 호출을 위한 상태 변수
    const [cafeName, setCafeName] = useState('');
    const [cafeBranch, setCafeBranch] = useState('');
    const [cafeData, setCafeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // API 호출 함수
    const fetchCafeInfo = async () => {
        if (!cafeName || !cafeBranch) {
            setError('카페 이름과 지점명을 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        setCafeData(null);

        try {
            // GET 요청으로 API 호출
            const response = await axios.get('/api/cafe', {
                params: {
                    cafeName: cafeName,
                    cafeBranch: cafeBranch
                }
            });
            setCafeData(response.data);
        } catch (err) {
            setError('카페 정보를 찾을 수 없습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // UI 렌더링
    return (
        <div>
            <h2>카페 정보 조회</h2>
            <input
                type="text"
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                placeholder="카페 이름"
            />
            <input
                type="text"
                value={cafeBranch}
                onChange={(e) => setCafeBranch(e.target.value)}
                placeholder="지점명"
            />
            <button onClick={fetchCafeInfo}>조회</button>

            {loading && <p>로딩 중...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            {cafeData && (
                <div>
                    <h3>{cafeData.cafeName} ({cafeData.cafeBranch})</h3>
                    <p>주소: {cafeData.cafeAddress}</p>
                    <p>전화번호: {cafeData.cafePhonNumber}</p>
                    <p>운영 시간: {cafeData.cafeOpen}</p>
                    {cafeData.cafeImgAddress && (
                        <img src={cafeData.cafeImgAddress} alt={`${cafeData.cafeName} 이미지`} style={{ width: '200px' }} />
                    )}
                </div>
            )}
        </div>
    );
};

export default CafeInfo;