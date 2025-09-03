
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import "../../css/AdminPage.css"; 
import { fetchUsers } from "../../service/adminAPI"; // 백엔드 통신 함수 import

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("members"); 
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("사용자 데이터 불러오기 실패:", error);
        setLoading(false);
      });
  }, []); 

  if (loading) {
    return (
      <Layout>
        <div className="admin-loading">로딩 중...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-page-container">
        {/* 관리자 페이지 헤더 */}
        <div className="admin-header">
          <h1 className="admin-title">관리자 페이지</h1>
          <div className="admin-menu">
            <Link
              to="/admin/members"
              className={activeTab === "members" ? "active" : ""}
            >
              회원관리
            </Link>
          
            <Link
              to="/admin/inquiries"
              className={activeTab === "inquiries" ? "active" : ""}
            >
              1:1 문의
            </Link>
          </div>
        </div>
        <div className="admin-content">
          {/* 회원 관리 섹션 */}
          {activeTab === "members" && (
            <div className="member-management-section">
              <h2 className="section-title">회원 관리</h2>
              <div className="search-bar">
                <input type="text" placeholder="회원 검색" />
                <button>검색</button>
              </div>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>회원 ID</th>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>가입일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.userId}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.joinDate}</td>
                      <td>
                        <button className="action-button update-button">
                          수정
                        </button>
                        <button className="action-button delete-button">
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                {}
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
