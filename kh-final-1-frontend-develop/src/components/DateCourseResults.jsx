import { Clock, MapPin, Wallet, ExternalLink } from "lucide-react";
import "../css/DateCourseResults.css";

export default function DateCourseResults({ searchData }) {
  // 샘플 데이트 코스 데이터
  const dateCourse = [
    {
      time: "11:00 - 13:00",
      emoji: "🎨",
      title: "오전 액티비티: '미술관 옆 아뜰리에'에서 드로잉 클래스",
      name: "미술관 옆 아뜰리에",
      cost: "2인 8만 원",
      description:
        "평범한 카페 대신, 서로의 모습을 그려주며 특별한 추억을 만들어보는 건 어떨까요? 강남역 인근의 '미술관 옆 아뜰리에'는 전문 강사의 도움을 받아 쉽게 그림을 그릴 수 있는 클래스를 운영합니다. 미술에 소질이 없더라도 걱정 마세요. 서로의 얼굴을 캐리커처로 그려주거나, 소중한 순간을 그림으로 남기며 웃음꽃을 피울 수 있습니다.",
      address:
        "서울 서초구 서초대로78길 42 현성빌딩 3층 (강남역 5번 출구에서 도보 5분)",
      link: "http://www.artside.co.kr/",
    },
    {
      time: "13:00 - 14:30",
      emoji: "🍜",
      title: "점심 식사: '땀땀'에서 베트남 현지 쌀국수",
      name: "땀땀",
      cost: "2인 4만 원",
      description:
        "이국적인 분위기에서 점심을 즐겨보세요. 강남역 맛집으로 유명한 '땀땀'은 진하고 깊은 국물의 소곱창 쌀국수와 숯불 직화 쌀국수로 유명합니다. 붐비는 시간대에는 웨이팅이 길 수 있으니 서두르시는 것을 추천합니다.",
      address:
        "서울 강남구 강남대로98길 12 1층 (강남역 11번 출구에서 도보 5분)",
      link: "https://www.instagram.com/ttamttam_gangnam/",
    },
    {
      time: "14:30 - 17:00",
      emoji: "💑",
      title: "오후 액티비티: '방탈출 카페 이스케이프 이즈'에서 추리 데이트",
      name: "이스케이프 이즈",
      cost: "2인 5만 원",
      description:
        "그림도 그리고 맛있는 점심도 먹었으니, 이번엔 머리를 써볼 차례입니다. 강남역 근처의 '이스케이프 이즈'는 다양한 테마의 방탈출 게임을 제공합니다. 둘이서 힘을 합쳐 단서를 찾고 문제를 해결하며, 서로의 새로운 모습과 뛰어난 팀워크를 발견할 수 있습니다. 스릴 넘치는 테마부터 아기자기한 테마까지 다양하니 취향에 맞게 선택해보세요.",
      address: "서울 서초구 강남대로75길 55, B1 (강남역 9번 출구에서 도보 3분)",
      link: "https://www.escapeis.co.kr/",
    },
  ];

  const totalCost = dateCourse.reduce((total, activity) => {
    const cost = parseInt(activity.cost.replace(/[^\d]/g, ""));
    return total + cost;
  }, 0);

  const formatCost = (cost) => {
    return cost.toLocaleString() + "원";
  };

  return (
    <div className="results-container">
      {/* 검색 결과 헤더 */}
      <div className="results-header">
        <h1 className="results-title" data-testid="results-title">
          <span className="sparkles">✨</span>
          이색적인 {searchData.district || "강남"} 데이트 코스 (11:00 ~ 20:00)
        </h1>
        <div className="results-meta">
          <div className="meta-item">
            <MapPin className="icon" />
            <span data-testid="result-district">
              {searchData.district || "강남구"}
            </span>
          </div>
          <div className="meta-item">
            <Clock className="icon" />
            <span data-testid="result-time">하루 종일</span>
          </div>
          <div className="meta-item">
            <Wallet className="icon" />
            <span data-testid="result-total-cost">
              총 예상 비용: {formatCost(totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* 활동 목록 */}
      <div className="activities-list">
        {dateCourse.map((activity, index) => (
          <div
            key={index}
            className="activity-card"
            data-testid={`activity-${index}`}
          >
            <div className="activity-content">
              {/* 시간과 제목 */}
              <div className="activity-header">
                <div className="activity-emoji" aria-label="activity-emoji">
                  {activity.emoji}
                </div>
                <div className="activity-info">
                  <div className="activity-badges">
                    <span
                      className="time-badge"
                      data-testid={`activity-time-${index}`}
                    >
                      {activity.time}
                    </span>
                    <span
                      className="cost-badge"
                      data-testid={`activity-cost-${index}`}
                    >
                      예상 비용: {activity.cost}
                    </span>
                  </div>
                  <h3
                    className="activity-title"
                    data-testid={`activity-title-${index}`}
                  >
                    {activity.title}
                  </h3>
                </div>
              </div>

              {/* 설명 */}
              <div className="activity-details">
                <p
                  className="activity-description"
                  data-testid={`activity-description-${index}`}
                >
                  {activity.description}
                </p>

                {/* 주소 */}
                <div className="activity-address">
                  <MapPin className="icon" />
                  <span data-testid={`activity-address-${index}`}>
                    {activity.address}
                  </span>
                </div>

                {/* 링크 */}
                <button
                  className="activity-link-button"
                  onClick={() => window.open(activity.link, "_blank")}
                  data-testid={`activity-link-${index}`}
                >
                  <ExternalLink className="icon" />
                  {activity.name} 더 알아보기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 총 비용 요약 */}
      <div className="cost-summary">
        <h3 className="summary-title" data-testid="total-summary-title">
          오늘 데이트 총 예상 비용
        </h3>
        <p className="summary-cost" data-testid="total-summary-cost">
          {formatCost(totalCost)}
        </p>
        <p className="summary-note">
          실제 비용은 개인의 선택에 따라 달라질 수 있습니다
        </p>
      </div>

      {/* 추가 팁 */}
      <div className="tips-section">
        <h3 className="tips-title">💡 데이트 팁</h3>
        <ul className="tips-list">
          <li>미술 클래스는 사전 예약이 필요할 수 있으니 미리 연락해보세요</li>
          <li>점심시간 맛집은 웨이팅이 길 수 있으니 여유시간을 두고 가세요</li>
          <li>
            방탈출은 난이도를 미리 확인하고 둘 다 즐길 수 있는 테마를
            선택해보세요
          </li>
          <li>
            대중교통 이용 시 지하철 강남역을 기준으로 모든 장소가 도보 10분
            이내입니다
          </li>
        </ul>
      </div>
    </div>
  );
}
