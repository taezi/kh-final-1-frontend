// src/App.js
import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage"; // PG-14 (메인)
import LoginPage from "./pages/LoginPage";
import PG24 from "./pages/PG24"; // 새로 추가
import EventsPage from "./pages/EventsPage";
function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          {/* PG-14 = 메인페이지 */}
          <Route path="/" element={<MainPage />} />

          {/* 로그인 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/events" element={<EventsPage />} />
          {/* PG-24 = 달력/행사 리스트 페이지 */}
          <Route path="/pg24" element={<PG24 />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
