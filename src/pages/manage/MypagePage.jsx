// src/pages/mypage/MypagePage.jsx
import Layout from "../../components/Layout";
import MypageUpdate from "../../components/mypage/Mypageupdate";
import MypageDelete from "../../components/mypage/MypageDelete";
import "../../css/MypagePage.css";
import useAuthStore from "../../store/authStore";
import { useState } from "react";
import InquiryDetailPage from "./inquiry/InquiryDetailPage";
import MypageInquiry from "../../components/mypage/MypageInquiry";
import MypageBookmark from "../../components/mypage/MypageBookmark";

import HeroStrip from "../../components/HeroStrip";
// 네가 넣어둔 이미지 그대로 사용
import MY_PAGE_HERO from "../../img/my-page.jpg";

export default function MypagePage() {
  const user = useAuthStore((state) => state.user);

  console.log(user);
  const [activeTab, setActiveTab] = useState("bookmark");

  return (
    <Layout>
      <div className="mypage-content-wrapper">
        <div className="mypage-menu">
          {/* 나의 북마크 버튼 */}
          <button
            className={activeTab === "bookmark" ? "active" : ""}
            onClick={() => setActiveTab("bookmark")}
          >
            나의 북마크
          </button>
          {/* 나의 문의 버튼 */}
          <button
            className={activeTab === "inquiry" ? "active" : ""}
            onClick={() => setActiveTab("inquiry")}
          >
            나의 문의
          </button>
          {/* 회원정보수정 버튼 */}
          <button
            className={activeTab === "update" ? "active" : ""}
            onClick={() => setActiveTab("update")}
          >
            회원정보수정
          </button>
          {/* 회원탈퇴 버튼 */}
          <button
            className={activeTab === "delete" ? "active" : ""}
            onClick={() => setActiveTab("delete")}
          >
            회원탈퇴
          </button>
        </div>
        <div className="mypage-content">
          {activeTab === "bookmark" && <MypageBookmark />}
          {activeTab === "inquiry" && <MypageInquiry></MypageInquiry>}
          {activeTab === "update" && <MypageUpdate user={user} />}
          {activeTab === "delete" && <MypageDelete />}

        </div>
      </div>
    </Layout>
  );
}
