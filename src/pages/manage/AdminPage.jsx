// src/pages/manage/AdminPage.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import AdminInquiry from "../../admin/AdminInquiry";
import AdminMember from "../../components/AdminMember"; 
import "../../css/AdminPage.css";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("members");

  return (
    <Layout>
      <div className="admin-page-container">
        {/* 관리자 페이지 헤더 */}
        <div className="admin-header">
          <h1 className="admin-title">관리자 페이지</h1>
          <div className="admin-menu">
            <Link
              to="#"
              onClick={() => setActiveTab("members")}
              className={activeTab === "members" ? "active" : ""}
            >
              회원관리
            </Link>
            <Link
              to="#"
              onClick={() => setActiveTab("inquiries")}
              className={activeTab === "inquiries" ? "active" : ""}
            >
              1:1 문의
            </Link>
          </div>
        </div>
        <div className="admin-content">
          {/* activeTab 상태에 따라 다른 컴포넌트 렌더링 */}
          {activeTab === "members" && <AdminMember />}
          {activeTab === "inquiries" && <AdminInquiry />}
        </div>
      </div>
    </Layout>
  );
}
