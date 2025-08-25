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

          {/* 보호된 라우트는 PrivateRoute 컴포넌트로 감쌉니다 */}

          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<AdminPage></AdminPage>} />
            <Route path="/mypage" element={<MypagePage></MypagePage>} />
            <Route path="/editor" element={<EditorPage></EditorPage>} />
            <Route path="/dateai" element={<DateaiPage></DateaiPage>} />
          </Route>

          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
