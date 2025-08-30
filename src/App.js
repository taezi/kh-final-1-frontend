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
import EditorDetailPage from "./pages/EditorDetailPage";
import EventsPage from "./pages/EventPage";
import NoticePage from "./pages/NoticePage";
import InquiryPage from "./pages/InquiryPage";
import MoviePage from "./pages/MoviePage";
import MoviedetailPage from "./pages/MoviedetailPage";
import CultureViewPage from "./pages/CultureViewPage";
import EditorEditPage from "./pages/EditorEditPage";
import NoticeWritePage from "./pages/NoticeWritePage";
import NoticeDetailPage from "./pages/NoticeDetailPage";
import NoticeEditPage from "./pages/NoticeEditPage";
import ServicerulePage from "./pages/ServicerulePage";


function App() {
  return (
    <BrowserRouter>
      <Navbar></Navbar>
      <div>
        <Routes>
          <Route path="/login" element={<LoginPage></LoginPage>} />
          <Route path="/signup" element={<SignupPage></SignupPage>} />
          <Route path="/servicerule" element={<ServicerulePage></ServicerulePage>} />
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

          <Route path="/movie" element={<MoviePage></MoviePage>} />
          <Route
            path="/movie/:id"
            element={<MoviedetailPage></MoviedetailPage>}
          />

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
