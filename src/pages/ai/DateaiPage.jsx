// src/pages/dateai/DateaiPage.jsx
import "../../css/DateaiPage.css";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import DateCourseForm from "../../components/DateCourseForm";
import DateCourseResults from "../../components/DateCourseResults";
import Layout from "../../components/Layout";
import { generateAI } from "../../service/aiAPI";

import HeroStrip from "../../components/HeroStrip";
import MY_PAGE_HERO from "../../img/my-page.jpg";

export default function DateaiPage() {
  const [showResults, setShowResults] = useState(false);
  const [searchData, setSearchData] = useState(null); // 파싱된 결과(JSON)
  const [loading, setLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (searchData) {
      console.log("searchData:", JSON.stringify(searchData, null, 2));
    }
  }, [searchData]);

  const parseAiResponse = (resp) => {
    // resp가 { data: ... } 또는 문자열인 경우 모두 대응
    const raw = resp?.data ?? resp;

    try {
      if (typeof raw === "string") {
        const parsed = JSON.parse(raw);
        return parsed;
      }
      // 이미 객체인 경우
      return raw;
    } catch (e) {
      // 일부 모델이 json 코드블럭(```json ... ```)으로 줄 때 제거 후 재시도
      const stripped = String(raw)
        .replace(/^```json\s*/i, "")
        .replace(/```$/i, "");
      try {
        return JSON.parse(stripped);
      } catch {
        throw new Error("AI 응답을 JSON으로 해석할 수 없습니다.");
      }
    }
  };

  const validateSchema = (json) => {
    if (!json || typeof json !== "object") return false;
    if (!json.date_course) return false;
    const dc = json.date_course;
    return (
      typeof dc.total_name === "string" &&
      typeof dc.total_desc === "string" &&
      typeof dc.total_time === "string" &&
      typeof dc.total_budget === "string" &&
      Array.isArray(dc.places) &&
      dc.places.length >= 1
    );
  };

  const handleSearch = async (data) => {
    setErrorMsg("");
    setSearchCriteria(data);

    const prompt = `
당신의 작업은 ‘서울 데이트 코스 1가지’를 만드는 것입니다. 아래 요구사항을 모두 지키세요.
[입력 파라미터]
- 지역: ${data.district || "상관없음"}
- 시작 시간: ${data.startDateTime || "미정"}
- 종료 시간: ${data.endDateTime || "미정"}
- 예산: ${data.budget ? data.budget + "원" : "제한 없음"}
- 추가 요청사항: ${data.query || "없음"}

[출력 형식]
- JSON만 출력. 코드 블록 금지.
- 스키마:
{
  "date_course": {
    "total_name": "string",
    "total_desc": "string",
    "total_time": "HH:mm ~ HH:mm",
    "total_budget": "###,###원",
    "places": [
      {
        "name": "string",
        "name_detail": "string",
        "desc": "string",
        "time": "HH:mm~HH:mm",
        "price": "###,###원" ,
        "url": "https://...",
        "address": "string (실제주소 (이전 장소로부터 도보 ##분))"
      }
    ]
  }
}

[엄격한 제약]
1) 최신 운영 중인 실제 장소만 사용(폐점/임시휴업 금지).
2) 모든 URL은 실제 접속 가능(공식 홈페이지 > 공식 SNS > 네이버지도(산책/공원)).
3) 장소 간 이동은 도보 20분 이내(지도 보행 경로 기준, 분 단위로 기입).
4) 가격은 현재 표기 가격(1인 기준, 대표 가격, 부가세/서비스료 포함). 확인 불가 시 제외하고 다른 후보.
5) 시작/종료 미정이면 4~5시간 코스로 합리 배치(영업시간 밖 제외).
6) (링크 다운/영업정보 불명/도보>20분) 조건이 하나라도 있으면 해당 장소 제외·교체.

[검증 로그(출력 금지)]
- 각 장소에 대해 (a) 검증 URL (b) 접속 성공 여부 (c) 도보 시간 (d) 가격 출처와 값 을 내부 점검 후 통과 항목만 최종 JSON 포함.

[생성 절차]
1) 후보 5~8개 수집 후 검증.
2) 도보 20분 이내로 연결 가능한 3~4곳 선정하여 1개의 코스로 구성.
3) 총 소요 시간/총 예산 계산 후 total_* 채우고 JSON 출력.

그리고 전 항목을 실제로 검증한 뒤, 존재하지 않거나 조건 불만족이면 코스를 교체하여 최종 JSON만 출력.
    `;

    try {
      setSearchData(null);
      setLoading(true);
      setShowResults(true);

      const resp = await generateAI(prompt);
      const parsed = parseAiResponse(resp);

      if (!validateSchema(parsed)) {
        setErrorMsg("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
        setSearchData(null);
      } else {
        setSearchData(parsed);
        setErrorMsg("");
      }

      // 결과로 전환되면 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setErrorMsg("AI 추천 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setSearchData(null);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setSearchData(null);
    setErrorMsg("");
    setLoading(false);
  };

  return (
    <Layout>
      {/* 상단 히어로 */}
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title="AI 데이트 코스 추천"
        subtitle="지역·시간·예산을 입력하면 코스를 자동으로 구성해드려요"
        align="left"
        height={600}
        variant="def"
      />

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

          {/* 로딩 */}
          {loading && (
            <p className="loading">AI가 데이트 코스를 생성하는 중입니다…</p>
          )}

          {/* 에러 */}
          {!loading && errorMsg && (
            <p className="error" role="alert">
              {errorMsg}
            </p>
          )}

          {/* 결과 */}
          {!loading && !errorMsg && searchData && (
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
