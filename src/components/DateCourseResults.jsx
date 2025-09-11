import { Clock, MapPin, Wallet, ExternalLink } from "lucide-react";
import "../css/DateCourseResults.css";

export default function DateCourseResults({ searchData, searchCriteria }) {
  console.log("넘어온 searchData:", JSON.stringify(searchData, null, 2));
  console.log("넘어온 searchCriteria:", searchCriteria);

  const course = searchData.date_course;

  const isValid =
    course &&
    course.total_name &&
    course.total_desc &&
    course.total_time &&
    course.total_budget &&
    Array.isArray(course.places);

  if (!isValid) {
    return (
      <div className="error-container">
        <p>⚠️ 오류가 발생했습니다. 다시 입력해주세요.</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()} // 👉 강제로 새로고침
        >
          다시 검색하기
        </button>
      </div>
    );
  }

  return (
    <div className="results-container">
      {/* 검색 결과 헤더 */}
      <div className="results-header">
        <h1 className="results-title" data-testid="results-title">
          <span className="sparkles">✨</span>
          {course.total_name}({course.total_time})
        </h1>
        <div className="results-meta">
          <div className="meta-item">
            <MapPin className="icon" />
            <span data-testid="result-district">{searchCriteria.district}</span>
          </div>
          <div className="meta-item">
            <Clock className="icon" />
            <span data-testid="result-time">하루 종일</span>
          </div>
          <div className="meta-item">
            <Wallet className="icon" />
            <span data-testid="result-total-cost">
              총 예상 비용: {course.total_budget}
            </span>
          </div>
        </div>
      </div>

      {/* 활동 목록 */}
      <div className="activities-list">
        {course.places.map((activity, index) => (
          <div
            key={index}
            className="activity-card"
            data-testid={`activity-${index}`}
          >
            <div className="activity-content">
              {/* 시간과 제목 */}
              <div className="activity-header">
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
                      예상 비용: {activity.price}
                    </span>
                  </div>
                  <h3
                    className="activity-title"
                    data-testid={`activity-title-${index}`}
                  >
                    {activity.name_detail}
                  </h3>
                </div>
              </div>

              {/* 설명 */}
              <div className="activity-details">
                <p
                  className="activity-description"
                  data-testid={`activity-description-${index}`}
                >
                  {activity.desc}
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
                  onClick={() => window.open(activity.url, "_blank")}
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
          {course.total_budget}
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
          <li>모든 장소가 도보 20분이내입니다</li>
        </ul>
      </div>
    </div>
  );
}
