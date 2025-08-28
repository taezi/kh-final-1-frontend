import "../css/DateaiPage.css";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import DateCourseForm from "../components/DateCourseForm";
import DateCourseResults from "../components/DateCourseResults";
import Layout from "../components/Layout";
import { generateAI } from "../service/aiAPI";

export default function DateaiPage(params) {
  const [showResults, setShowResults] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState(null);

  useEffect(() => {
    console.log("searchData : " + JSON.stringify(searchData, null, 2));
  }, [searchData]);

  const handleSearch = async (data) => {
    console.log("검색 데이터:", data);
    setSearchCriteria(data);

    // ✅ AI 프롬프트 생성
    const prompt = `
     당신의 작업은 ‘서울 데이트 코스 1가지’를 만드는 것입니다. 아래 요구사항을 모두 지키세요.  
     [입력 파라미터] - 지역: ${data.district || "상관없음"} - 시작 시간: ${
      data.startDateTime || "미정"
    } - 종료 시간: ${data.endDateTime || "미정"} - 예산: ${
      data.budget ? data.budget + "원" : "제한 없음"
    } - 추가 요청사항: ${
      data.query || "없음"
    }  [출력 형식] - JSON만 출력. 코드 블록 금지. - 스키마: 
    {   "date_course": {     "total_name": "string",     "total_desc": "string",     "total_time": "HH:mm ~ HH:mm",     
       "total_budget": "###,###원",     
       "places": [       {         "name": "string", //실제 장소이름임 ex)봉추찜닭 강남역점,  템플 스트라이크   "name_detail": "string",    // 식사(아침,점심,저녁),액티비티(오전,오후), 까페도 앞에써줄래 ex) 점심 식사: '땀땀'에서 베트남 현지 쌀국수, 오전 액티비티: '미술관 옆 아뜰리에'에서 드로잉 클래스        "desc": "string",         "time": "HH:mm~HH:mm",         "price": "###,###원",  //2인이상의 가격은 합쳐서 "2인 ###,###원"       "url": "https://...",          // 접속 확인된 공식 웹사이트 1순위, 공식 SNS 2순위, 산책/공원은 네이버지도 검색 URL         "address": "string (실제주소 (이전 장소로부터 도보 ##분))" //ex) 서울 강남구 강남대로98길 12 1층(땀땀에서부터 도보로 15분)      }     ]   } }  
       // [엄격한 제약] 1) 최신 운영 중인 실제 장소만 사용. ‘영업 종료/폐점/임시휴업’ 표시는 절대 추천 금지. 
       // 2) 모든 URL은 실제 접속 가능해야 함. 확인 방법:    - 우선순위: 공식 웹사이트 > 공식 인스타/페북 등 > 네이버지도(산책/거리 탐방).    - 200/3xx 응답 또는 정상 랜딩이 확인되지 않으면 제외. 
       // 3) 각 장소 간 이동은 ‘도보 20분 이내’여야 함. 네이버지도/구글지도 보행 경로 시간으로 검증해 분 단위로 기입. 
       // 4) 가격은 ‘정확한 현재 표기 가격’만. 소수/모호/약/부터/대략 금지.    - 메뉴·이용권 등 실제 페이지에 표시된 가장 대표 가격을 1인 기준으로 명시.    - 부가세/서비스료 포함 표기를 따름.    - 확인 불가 시 그 장소는 제외하고 다른 후보를 찾는다. 
       // 5) 시작/종료 시간이 미정이면 4~5시간 내 코스로 합리적 배치. 영업시간 바깥의 장소는 배제. 6) 검증 실패(링크 다운/영업정보 불명/도보>20분) 항목이 하나라도 있으면 해당 장소 전체를 교체하고 다시 검증한다.  
       // [검증 로그(출력 포함 금지)] - 각 장소에 대해: (a) 검증한 URL, (b) 접속 성공 여부, (c) 지도 도보 시간, (d) 가격 출처와 값 을 내부적으로 점검하고,  
       //  조건을 통과한 항목만 최종 JSON에 포함하라. - 검증 로그는 출력하지 말고, 최종 JSON만 출력하라.  
       // [생성 절차] 1) 후보 5~8개를 수집하고 검증한다. 2) 도보 20분 이내로 연결 가능한 3~4곳을 골라 1개의 코스로 구성한다. 
       // 3) 총 소요 시간·총 예산을 계산해 total_* 필드에 채운 뒤 JSON을 출력한다.
      그리고 다 코스까지 나면 실제로 구글에 존재하는 장소들인지 검증하고 실제로 존재하지않으면 다시 코스를 짜서 알려줄래
    `;

    try {
      setSearchData(null);
      setLoading(true);
      setShowResults(true);
      const response = await generateAI(prompt);
      console.log("response 2 : " + JSON.stringify(response, null, 2));
      setSearchData(response);
    } catch (err) {
      console.error(err);
      setSearchData({ error: "AI 추천 중 오류가 발생했습니다" });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setSearchData(null);
    setLoading(false);
  };

  return (
    <Layout>
      {showResults ? (
        <div className="date-course-page">
          <div className="back-button-container">
            <button
              className="back-button"
              onClick={handleBackToSearch}
              data-testid="back-to-search"
            >
              <ArrowLeft className="icon" />
              <span>다시 검색하기</span>
            </button>
          </div>

          {/*  로딩 중 표시 */}
          {loading && <p className="loading">검색중입니다...</p>}

          {/*  결과 표시 */}
          {!loading && searchData && (
            <DateCourseResults
              searchData={searchData}
              searchCriteria={searchCriteria}
            />
          )}
        </div>
      ) : (
        <div className="date-course-page">
          <div className="main-header">
            <h1 className="main-title" data-testid="main-title">
              사용자님 안녕하세요
            </h1>
            <p className="subtitle" data-testid="subtitle">
              어떤 데이트코스를 원하시나요?
            </p>
          </div>
          <DateCourseForm onSearch={handleSearch} />
          <div className="footer-info">
            <p className="main-info">
              정확한 정보를 입력해주시면 더 맞춤형 데이트 코스를 추천해드립니다
            </p>
            <p className="sub-info">
              모든 필드를 채우지 않아도 검색이 가능합니다
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}
