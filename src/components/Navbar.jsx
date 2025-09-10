import { useEffect, useState } from "react";
import {
  MapPin,
  UserStar,
  UserCheck,
  UserCog,
  Cloud,
  CloudRain,
  Sun,
  Snowflake,
  CloudSun,
} from "lucide-react";
import "../css/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar({ className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();
  const isLoggedIn = !!user;

  const [weather, setWeather] = useState({ temp: null, sky: null, pty: null });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("http://localhost:9999/api/weather/now"); // 스프링 서버
        const data = await res.json();

        console.log(data);
        // 기온(TMP), 하늘상태(SKY), 강수형태(PTY) 추출
        const { temp, sky, pty } = data;

        setWeather({ temp, sky, pty });
      } catch (err) {
        console.error("날씨 API 에러:", err);
      }
    };

    fetchWeather();
  }, []);

  // 아이콘 매핑 함수
  const getWeatherIcon = () => {
    if (weather.pty && weather.pty !== "0") {
      switch (weather.pty) {
        case "1":
          return <CloudRain className="weather-icon" />; // 비
        case "2":
          return <CloudRain className="weather-icon" />; // 비/눈
        case "3":
          return <Snowflake className="weather-icon" />; // 눈
        case "4":
          return <CloudRain className="weather-icon" />; // 소나기
        default:
          return <Cloud className="weather-icon" />;
      }
    } else {
      switch (weather.sky) {
        case "1":
          return <Sun className="weather-icon" />; // 맑음
        case "3":
          return <CloudSun className="weather-icon" />; // 구름많음
        case "4":
          return <Cloud className="weather-icon" />; // 흐림
        default:
          return <Sun className="weather-icon" />;
      }
    }
  };

  const handleLogout = async () => {
    if (user) {
      console.log(user);

      logout(); // Zustand 액션 함수 호출
      alert("로그아웃 성공");
    } else {
      alert("현재 로그인된 상태가 아닙니다.");
    }
  };

  const handleMouseEnter = (dropdown) => {
    setActiveDropdown(dropdown);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
    setIsExpanded(false);
  };

  const handleDropdownItemClick = (category, type) => {
    console.log(`Navigate to: ${category}${type ? ` - ${type}` : ""}`);
    // TODO: 여기에 라우팅 로직을 추가하세요
    if (category === "recommendations" && type === "ai") {
      navigate("/dateai");
    }
    if (category === "recommendations" && type === "editor") {
      navigate("/editor");
    }
    if (category === "places" && type === "culture") {
      navigate("/culture");
    }
    if (category === "places" && type === "restaurants") {
      navigate("/restaurants");
    }
    if (category === "places" && type === "cafes") {
      navigate("/cafes");
    }
    if (category === "places" && type === "movie") {
      navigate("/movie");
    }
    if (category === "customerservice" && type === "notice") {
      navigate("/notice");
    }
    if (category === "customerservice" && type === "inquiry") {
      navigate("/inquiry");
    }

    handleMouseLeave();
  };

  return (
    <header
      className={`header-container ${
        isExpanded ? "expanded" : "dark"
      } ${className}`}
    >
      <div className="header-content">
        <div className="header-inner">
          {/* Logo */}
          <div className="logo-section">
            <a
              href="#"
              className="logo"
              data-testid="link-home"
              onClick={() => navigate("/")}
            >
              Seoul Date
            </a>
          </div>

          {/* Navigation */}
          <nav className="nav-menu">
            {/* Places Dropdown */}
            <div
              className="nav-item"
              onMouseEnter={() => handleMouseEnter("places")}
              onMouseLeave={handleMouseLeave}
              data-testid="nav-places"
            >
              플레이스
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => handleDropdownItemClick("places", "culture")}
                  data-testid="dropdown-culture"
                >
                  문화/행사
                </div>
                <div
                  className="dropdown-item"
                  onClick={() =>
                    handleDropdownItemClick("places", "restaurants")
                  }
                  data-testid="dropdown-restaurants"
                >
                  맛집
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => handleDropdownItemClick("places", "cafes")}
                  data-testid="dropdown-cafes"
                >
                  까페
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => handleDropdownItemClick("places", "movie")}
                  data-testid="dropdown-cafes"
                >
                  영화
                </div>
              </div>
            </div>

            {/* Recommendations Dropdown */}
            <div
              className="nav-item"
              onMouseEnter={() => handleMouseEnter("recommendations")}
              onMouseLeave={handleMouseLeave}
              data-testid="nav-recommendations"
            >
              추천
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() =>
                    handleDropdownItemClick("recommendations", "editor")
                  }
                  data-testid="dropdown-editor-recommendations"
                >
                  에디터 추천 데이트코스
                </div>
                <div
                  className="dropdown-item"
                  onClick={() =>
                    handleDropdownItemClick("recommendations", "ai")
                  }
                  data-testid="dropdown-ai-recommendations"
                >
                  AI활용한 데이트 코스 추천
                </div>
              </div>
            </div>
            {/* customerservice Dropdown */}
            <div
              className="nav-item"
              onMouseEnter={() => handleMouseEnter("customerservice")}
              onMouseLeave={handleMouseLeave}
              data-testid="nav-customerservice"
            >
              고객센터
              <div className="dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() =>
                    handleDropdownItemClick("customerservice", "notice")
                  }
                  data-testid="dropdown-notice"
                >
                  공지사항
                </div>
                <div
                  className="dropdown-item"
                  onClick={() =>
                    handleDropdownItemClick("customerservice", "inquiry")
                  }
                  data-testid="dropdown-inquiry"
                >
                  1:1문의
                </div>
              </div>
            </div>
          </nav>

          {/* Right Section */}
          <div className="right-section">
            {/* Weather Info */}
            <div className="weather-info" data-testid="weather-info">
              {getWeatherIcon()}
              <span>{weather.temp ? `${weather.temp}°C` : "로딩중..."}</span>
            </div>

            {/* Login Button */}
            {isLoggedIn ? (
              <>
                <div>
                  <span className="welcome-message">
                    {user.username}님 환영합니다.
                  </span>
                  {user.role === "admin" ? (
                    <>
                      <button
                        className="icon-btn"
                        onClick={() => navigate("/admin")}
                      >
                        <UserStar className="icon" />
                        관리자 페이지
                      </button>
                    </>
                  ) : user.role === "editor" ? (
                    <>
                      <button
                        className="icon-btn"
                        onClick={() => navigate("/editor")}
                      >
                        <UserCheck className="icon" />
                        에디터 페이지
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="icon-btn"
                        onClick={() => navigate("/mypage")}
                      >
                        <UserCog className="icon" />
                        마이페이지
                      </button>
                    </>
                  )}
                </div>
                <button onClick={handleLogout} className="login-btn">
                  로그아웃
                </button>
              </>
            ) : (
              <Link to="/login" className="login-btn">
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
