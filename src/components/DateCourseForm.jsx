import { useState } from "react";
import { Calendar, Clock, MapPin, Search, Wallet } from "lucide-react";
import "../css/DateCourseForm.css";

export default function DateCourseForm({ onSearch }) {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [budget, setBudget] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 서울시 구 목록
  const seoulDistricts = [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
  ];

  const handleSearch = () => {
    const data = {
      district: selectedDistrict,
      startDateTime: `${startDate} ${startTime}`,
      endDateTime: `${endDate} ${endTime}`,
      budget: budget,
      query: searchQuery,
    };

    onSearch(data);
  };

  const formatBudget = (value) => {
    // 숫자만 추출하고 천 단위 콤마 추가
    const numbers = value.replace(/[^\d]/g, "");
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleBudgetChange = (e) => {
    const formatted = formatBudget(e.target.value);
    setBudget(formatted);
  };

  return (
    <div className="form-card">
      <div className="form-content">
        <div className="form-fields">
          {/* 지역 선택 */}
          <div className="field-group">
            <label className="field-label">
              <MapPin className="icon" />
              지역명 (서울시)
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="form-select"
              data-testid="select-district"
            >
              <option value="">구를 선택해주세요 (예: 강남구, 서초구)</option>
              {seoulDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* 데이트 시작시간 */}
          <div className="field-group">
            <label className="field-label">
              <Calendar className="icon" />
              데이트 시작시간
            </label>
            <div className="date-time-group">
              <div className="date-input-group">
                <label className="input-sublabel">날짜</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                  data-testid="input-start-date"
                />
              </div>
              <div className="time-input-group">
                <label className="input-sublabel">시간</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-input"
                  data-testid="input-start-time"
                />
              </div>
            </div>
          </div>

          {/* 데이트 종료시간 */}
          <div className="field-group">
            <label className="field-label">
              <Clock className="icon" />
              데이트 종료시간
            </label>
            <div className="date-time-group">
              <div className="date-input-group">
                <label className="input-sublabel">날짜</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                  data-testid="input-end-date"
                />
              </div>
              <div className="time-input-group">
                <label className="input-sublabel">시간</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="form-input"
                  data-testid="input-end-time"
                />
              </div>
            </div>
          </div>

          {/* 예산 */}
          <div className="field-group">
            <label className="field-label">
              <Wallet className="icon" />
              예산
            </label>
            <div className="budget-input-container">
              <input
                type="text"
                value={budget}
                onChange={handleBudgetChange}
                placeholder="예산을 입력해주세요 (예: 100,000)"
                className="form-input budget-input"
                data-testid="input-budget"
              />
              <span className="currency-symbol">원</span>
            </div>
          </div>

          {/* 검색창 */}
          <div className="field-group">
            <label className="field-label">
              <Search className="icon" />
              추가 요청사항
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="특별한 요청이나 선호하는 활동을 입력해주세요 (예: 실내 데이트, 맛집 위주, 조용한 곳)"
              className="form-input"
              data-testid="input-search-query"
            />
          </div>

          {/* 검색 버튼 */}
          <div className="search-button-container">
            <button
              onClick={handleSearch}
              className="search-button"
              data-testid="button-search"
            >
              <Search className="icon" />
              데이트 코스 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
