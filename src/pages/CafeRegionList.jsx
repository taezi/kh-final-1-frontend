// CafeRegionList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * CafeRegionList 컴포넌트는 특정 지역구의 카페 목록을 조회합니다.
 * @returns {JSX.Element} 지역별 카페 목록 UI
 */
const CafeRegionList = () => {
    // API 호출을 위한 상태 변수
    const [region, setRegion] = useState('');
    const [cafeList, setCafeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // API 호출 함수
    const fetchCafeList = async () => {
        if (!region) {
            setError('지역 이름을 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        setCafeList([]);

        try {
            // GET 요청으로 API 호출
            // NOTE: 이 API는 코드에 명시적으로 없지만, findByRegion 매퍼에 따라 필요합니다.
            const response = await axios.get(`/api/cafe/region`, {
                params: {
                    region: region
                }
            });
            setCafeList(response.data);
        } catch (err) {
            setError('카페 목록을 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // UI 렌더링
    return (
        <div>
            <h2>지역별 카페 목록</h2>
            <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="지역구 이름 (예: 강남구)"
            />
            <button onClick={fetchCafeList}>검색</button>

            {loading && <p>로딩 중...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <ul>
                {cafeList.length > 0 ? (
                    cafeList.map((cafe) => (
                        <li key={cafe.cafeNo}>
                            <strong>{cafe.cafeName}</strong> ({cafe.cafeBranch})
                            {cafe.cafeImgAddress && (
                                <img src={cafe.cafeImgAddress} alt={`${cafe.cafeName} 이미지`} style={{ width: '100px' }} />
                            )}
                        </li>
                    ))
                ) : (
                    !loading && !error && <p>해당 지역의 카페가 없습니다.</p>
                )}
            </ul>
        </div>
    );
};

export default CafeRegionList;