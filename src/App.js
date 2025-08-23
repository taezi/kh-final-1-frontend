import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Navbar from "./components/Navbar";
import FindIdPage from "./pages/FindIdPage";
import FindPwdPage from "./pages/FindPwdPage";
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

          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
