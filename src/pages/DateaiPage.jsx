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
      사용자가 원하는 데이트 코스 조건은 다음과 같아:
      - 지역: ${data.district || "상관없음"}
      - 시작 시간: ${data.startDateTime || "미정"}
      - 종료 시간: ${data.endDateTime || "미정"}
      - 예산: ${data.budget ? data.budget + "원" : "제한 없음"}
      - 추가 요청사항: ${data.query || "없음"}

      위 조건에 맞는 서울 데이트 코스를 추천해줘.
      추천해주는 코스는 반드시 가장 최신 정보를 반영하여 현재 운영하고있고 존재해야하는 장소들이야
      추천해주는 모든 장소의 URL은 반드시 접속 가능 여부를 확인하고 접속가능한곳만 추천해줘
      1가지 코스를 구체적으로 알려줘.
      date_course가 있고 그 안에 total_name, total_desc, total_time(ex) 8:00 ~ 17:00),total_budget(약 이라는 단어는 쓰면안되고 정확한 ,하고 원 포함해서 숫자로 써줘 ex)100,000원),
      places가있고 places안에 name, name_detail, desc, time, price,url, addrss가 있는 json형태로줘.
      JSON 블록만 출력해줘. 코드 블록은 제외하고.
      각 코스는 도보로 20분 이내로 이동할 수 있고, 예산은 최대한 맞춰주되 어느정도 덜쓰거나 더써도됨.
      각 코스는 
      장소이름(변수명은 name이고 장소이름임),
      장소 이름 디테일(변수명은 name_detail 이고 식사(아침,점심,저녁),액티비티(오전,오후), 까페도 앞에써줄래 ex) 점심 식사: '땀땀'에서 베트남 현지 쌀국수, 오전 액티비티: '미술관 옆 아뜰리에'에서 드로잉 클래스), 
      활동 설명(desc), 
      예상 소요시간(ex 13:00~15:00)(time),
      대략적인 비용(변수명은 price이고 ,하고 원 포함해서 숫자로 써줘 ex)100,000원), 
      실제 업체 링크(변수명은 url이고 각 장소의 url 변수에는 1순위 반드시 실제로 접속 가능한 공식(눌렀을때 not founnd, 존재하지않는페이지) 웹사이트 2순위 반드시 실제로 접속 가능한 인스타그램, 페이스북 등 공식 SNS 계정링크("죄송합니다. 페이지를 사용할 수 없습니다."라고 뜨면 안됨,
      산책,거리 탐방 같은 장소들은 네이버지도로 해당 장소를 검색한 url을 알려줘)를 넣어줘), 
      주소(변수명은 address이고 옆에 ()를 사용해서 전에 장소부터 거리가 얼마인지 표시해줘 그리고 첫번째 장소는 근처역 그 기준으로 도보로 얼마나 걸리는지 써주면됨 ex) 서울 강남구 강남대로98길 12 1층(땀땀에서부터 도보로 15분) 또한 가장 최신 정보를 반영하여, 반드시 현재 운영 중인 정확한 주소)을 포함
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
