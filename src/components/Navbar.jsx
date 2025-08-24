import { useState } from "react";
import {
  Search,
  Heart,
  Globe,
  Menu,
  MapPin,
  UserStar,
  UserCheck,
  UserCog,
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
            {/* <Link to="/" className="logo" data-testid="link-home">
              <img
                src={logoImage}
                alt="Seoul Date Logo"
                className="logo-image"
              />
              <span className="logo-text">Seoul Date</span>
            </Link> */}
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
                  onClick={() => handleDropdownItemClick("culture")}
                  data-testid="dropdown-culture"
                >
                  문화/행사
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => handleDropdownItemClick("restaurants")}
                  data-testid="dropdown-restaurants"
                >
                  맛집
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => handleDropdownItemClick("cafes")}
                  data-testid="dropdown-cafes"
                >
                  까페
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
                  에디터 추천 데이터코스
                </div>
                <div
                  className="dropdown-item"
                  onClick={() =>
                    handleDropdownItemClick("recommendations", "ai")
                  }
                  data-testid="dropdown-ai-recommendations"
                >
                  AI활용한 데이터 코스 추천
                </div>
              </div>
            </div>
          </nav>

          {/* Right Section */}
          <div className="right-section">
            {/* Weather Info */}
            <div className="weather-info" data-testid="weather-info">
              <MapPin className="weather-icon" />
              <span>31.6°C</span>
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
