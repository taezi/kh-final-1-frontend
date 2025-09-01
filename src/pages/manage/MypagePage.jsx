import Layout from "../../components/Layout";
import MypageUpdate from "../../components/Mypageupdate";
import MypageDelete from "../../components/MypageDelete";
import "../../css/MypagePage.css";
import useAuthStore from "../../store/authStore";
import { useState } from "react";
import InquiryDetailPage from "./inquiry/InquiryDetailPage";
import MypageInquiry from "../../components/MypageInquiry";

export default function MypagePage() {
  const user = useAuthStore((state) => state.user);
  console.log(user);
  const [activeTab, setActiveTab] = useState("update");

  return (
    <Layout>
      <div className="mypage-content-wrapper">
        <div className="mypage-menu">
          {/* 나의 문의 버튼 */}
          <button
            className={activeTab === "update" ? "active" : ""}
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
          {activeTab === "inquiry" && <MypageInquiry></MypageInquiry>}
          {activeTab === "update" && <MypageUpdate user={user} />}
          {activeTab === "delete" && <MypageDelete />}
        </div>
      </div>
    </Layout>
  );
}
