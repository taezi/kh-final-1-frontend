import "../css/DateaiPage.css";
import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";
import DateCourseForm from "../components/DateCourseForm";
import DateCourseResults from "../components/DateCourseResults";
import Layout from "../components/Layout";
import { generateAI } from "../service/aiAPI";

export default function DateaiPage(params) {
  const [showResults, setShowResults] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (data) => {
    console.log("검색 데이터:", data);

    // ✅ AI 프롬프트 생성
    const prompt = `
      사용자가 원하는 데이트 코스 조건은 다음과 같아:
      - 지역: ${data.district || "상관없음"}
      - 시작 시간: ${data.startDateTime || "미정"}
      - 종료 시간: ${data.endDateTime || "미정"}
      - 예산: ${data.budget ? data.budget + "원" : "제한 없음"}
      - 추가 요청사항: ${data.query || "없음"}

      위 조건에 맞는 서울 데이트 코스를 추천해줘.
      1가지 코스를 구체적으로 알려줘.
      각 코스는 장소 이름(name), 활동 설명(desc), 예상 소요시간(ex 13:00~15:00)(time), 대략적인 비용(price)을 포함해서 json형태로줘.
    `;

    try {
      setSearchData(null);
      setLoading(true);
      setShowResults(true);

      const response = await generateAI(prompt);
      setSearchData(response);
      console.log("searchData : " + searchData);
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
            <DateCourseResults searchData={searchData} />
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
