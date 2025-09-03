// src/pages/mypage/MypagePage.jsx
import Layout from "../../components/Layout";
import MypageUpdate from "../../components/Mypageupdate";
import MypageDelete from "../../components/MypageDelete";
import "../../css/MypagePage.css";
import useAuthStore from "../../store/authStore";
import { useState } from "react";
import MypageInquiry from "../../components/MypageInquiry";

import HeroStrip from "../../components/HeroStrip";
// 네가 넣어둔 이미지 그대로 사용
import MY_PAGE_HERO from "../../img/my-page.jpg";

export default function MypagePage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("update");

  return (
    <Layout>
      {/* 페이지 스코프 래퍼: 이 안에서만 여백/배경 등을 덮어쓰기 */}
      <div className="mypage-page">
        {/* 상단 풀블리드 히어로 */}
        <HeroStrip
          kicker="MY PAGE"
          title="마이페이지"
          subtitle="나의 문의 · 회원정보수정"
          imageSrc={MY_PAGE_HERO}
          height={750}
          align="left"
          variant="visitseoul"
        />

        {/* 본문 */}
        <div className="mypage-content-wrapper">
          <div className="mypage-menu">
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
            {activeTab === "inquiry" && <MypageInquiry />}
            {activeTab === "update" && <MypageUpdate user={user} />}
            {activeTab === "delete" && <MypageDelete />}
          </div>
        </div>
      </div>
    </Layout>
  );
}
