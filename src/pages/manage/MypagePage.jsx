// src/pages/mypage/MypagePage.jsx
import Layout from "../../components/Layout";
import MypageUpdate from "../../components/mypage/Mypageupdate";
import MypageDelete from "../../components/mypage/MypageDelete";
import "../../css/MypagePage.css";
import useAuthStore from "../../store/authStore";
import { useState } from "react";
import MypageInquiry from "../../components/mypage/MypageInquiry";
import MypageBookmark from "../../components/mypage/MypageBookmark";

import HeroStrip from "../../components/HeroStrip";
import MY_PAGE_HERO from "../../img/my-page.jpg"; // ✅ 이미지 경로 확인

export default function MypagePage() {
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState("bookmark");

  return (
    <Layout>
      {/* ✅ HeroStrip 추가 */}
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title="마이페이지"
        subtitle="북마크 ／ 문의 ／ 회원정보수정 ／ 회원탈퇴"
        align="left"
        height={600}
        variant="def"
      />

      <div className="mypage-content-wrapper">
        <div className="mypage-menu">
          <button
            className={activeTab === "bookmark" ? "active" : ""}
            onClick={() => setActiveTab("bookmark")}
          >
            나의 북마크
          </button>
          <button
            className={activeTab === "inquiry" ? "active" : ""}
            onClick={() => setActiveTab("inquiry")}
          >
            나의 문의
          </button>
          <button
            className={activeTab === "update" ? "active" : ""}
            onClick={() => setActiveTab("update")}
          >
            회원정보수정
          </button>
          <button
            className={activeTab === "delete" ? "active" : ""}
            onClick={() => setActiveTab("delete")}
          >
            회원탈퇴
          </button>
        </div>

        <div className="mypage-content">
          {activeTab === "bookmark" && <MypageBookmark />}
          {activeTab === "inquiry" && <MypageInquiry />}
          {activeTab === "update" && <MypageUpdate user={user} />}
          {activeTab === "delete" && <MypageDelete />}
        </div>
      </div>
    </Layout>
  );
}
