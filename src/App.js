import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Navbar from "./components/Navbar";
import FindIdPage from "./pages/FindIdPage";
import FindPwdPage from "./pages/FindPwdPage";
import PrivateRoute from "./components/PrivateRoute";
import AdminPage from "./pages/AdminPage";
import EditorPage from "./pages/EditorPage";
import MypagePage from "./pages/MypagePage";
import DateaiPage from "./pages/DateaiPage";
import CulturePage from "./pages/CulturePage";
import RestaurantPage from "./pages/RestaurantPage";
import CafePage from "./pages/CafePage";
import EditorWritePage from "./pages/EditorWritePage";
import EventsPage from "./pages/EventPage";
import NoticePage from "./pages/NoticePage";
import InquiryPage from "./pages/InquiryPage";
import MoviePage from "./pages/MoviePage";
import MoviedetailPage from "./pages/MoviedetailPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar></Navbar>
      <div>
        <Routes>
          <Route path="/login" element={<LoginPage></LoginPage>} />
          <Route path="/signup" element={<SignupPage></SignupPage>} />
          <Route path="/" element={<MainPage></MainPage>} />
          <Route path="/findid" element={<FindIdPage></FindIdPage>} />
          <Route path="/findpwd" element={<FindPwdPage></FindPwdPage>} />
          <Route path="/culture" element={<CulturePage></CulturePage>} />
          <Route
            path="/restaurants"
            element={<RestaurantPage></RestaurantPage>}
          />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/cafes" element={<CafePage></CafePage>} />
          <Route path="/editor" element={<EditorPage></EditorPage>} />
          <Route path="/notice" element={<NoticePage></NoticePage>} />
          <Route
            path="/editorWrite"
            element={<EditorWritePage></EditorWritePage>}
          />

          <Route path="/movie" element={<MoviePage></MoviePage>} />
          <Route
            path="/moviedetail"
            element={<MoviedetailPage></MoviedetailPage>}
          />

          {/* 보호된 라우트는 PrivateRoute 컴포넌트로 감쌉니다 */}
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<AdminPage></AdminPage>} />
            <Route path="/mypage" element={<MypagePage></MypagePage>} />
            <Route path="/dateai" element={<DateaiPage></DateaiPage>} />
            <Route path="/inquiry" element={<InquiryPage></InquiryPage>} />
          </Route>
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
