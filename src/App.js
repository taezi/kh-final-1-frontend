import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import Navbar from "./components/Navbar";
import FindIdPage from "./pages/auth/FindIdPage";
import FindPwdPage from "./pages/auth/FindPwdPage";
import PrivateRoute from "./components/PrivateRoute";
import AdminPage from "./pages/AdminPage";
import EditorPage from "./pages/editor/EditorPage";
import MypagePage from "./pages/MypagePage";
import DateaiPage from "./pages/ai/DateaiPage";
import CulturePage from "./pages/place/CulturePage";
import RestaurantPage from "./pages/place/RestaurantPage";
import CafePage from "./pages/place/CafePage";
import EditorWritePage from "./pages/editor/EditorWritePage";
import EditorDetailPage from "./pages/editor/EditorDetailPage";
import EventsPage from "./pages/place/EventPage";
import NoticePage from "./pages/notice/NoticePage";
import InquiryPage from "./pages/InquiryPage";
import MoviePage from "./pages/place/MoviePage";
import MoviedetailPage from "./pages/place/MoviedetailPage";
import CultureViewPage from "./pages/place/CultureViewPage";
import EditorEditPage from "./pages/editor/EditorEditPage";
import NoticeWritePage from "./pages/notice/NoticeWritePage";
import NoticeDetailPage from "./pages/notice/NoticeDetailPage";
import NoticeEditPage from "./pages/notice/NoticeEditPage";
import ServicerulePage from "./pages/auth/ServicerulePage";

function App() {
  return (
    <BrowserRouter>
      <Navbar></Navbar>
      <div>
        <Routes>
          <Route path="/login" element={<LoginPage></LoginPage>} />
          <Route path="/signup" element={<SignupPage></SignupPage>} />
          <Route
            path="/servicerule"
            element={<ServicerulePage></ServicerulePage>}
          />
          <Route path="/" element={<MainPage></MainPage>} />
          <Route path="/findid" element={<FindIdPage></FindIdPage>} />
          <Route path="/findpwd" element={<FindPwdPage></FindPwdPage>} />
          <Route path="/culture" element={<CulturePage></CulturePage>} />
          <Route path="/culture/:id" element={<CultureViewPage />} />
          <Route
            path="/restaurants"
            element={<RestaurantPage></RestaurantPage>}
          />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/cafes" element={<CafePage></CafePage>} />

          <Route path="/editor" element={<EditorPage></EditorPage>} />
          <Route path="/editor/:editorno" element={<EditorDetailPage />} />

          <Route path="/movie" element={<MoviePage></MoviePage>} />
          <Route
            path="/movie/:id"
            element={<MoviedetailPage></MoviedetailPage>}
          />

          <Route path="/notice" element={<NoticePage></NoticePage>} />

          {/* 로그인만 체크 */}
          <Route element={<PrivateRoute />}>
            <Route path="/mypage" element={<MypagePage></MypagePage>} />
            <Route path="/dateai" element={<DateaiPage></DateaiPage>} />
            <Route path="/inquiry" element={<InquiryPage></InquiryPage>} />
          </Route>
          {/* 관리자만 체크 */}
          <Route element={<PrivateRoute requiredRole="admin" />}>
            <Route path="/admin" element={<AdminPage></AdminPage>} />
            <Route
              path="/noticeWrite"
              element={<NoticeWritePage></NoticeWritePage>}
            />
            <Route path="/notice/:noticeno" element={<NoticeDetailPage />} />
            <Route path="/notice/edit/:noticeno" element={<NoticeEditPage />} />
          </Route>

          {/* 에디터만 체크 */}
          <Route element={<PrivateRoute requiredRole="editor" />}>
            <Route
              path="/editorWrite"
              element={<EditorWritePage></EditorWritePage>}
            />
            <Route path="/editor/edit/:editorno" element={<EditorEditPage />} />
          </Route>

          {/* 그외의 주소 404 */}
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
