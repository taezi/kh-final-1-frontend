// src/admin/AdminMembers.jsx
import React, { useState, useEffect } from "react";
import { deleteAdminUser, getUserData } from "../service/adminAPI";

export default function AdminMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserData()
      .then((data) => {
        console.log(data);
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("사용자 데이터 불러오기 실패:", error);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (userno) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        const response = await deleteAdminUser({
          userno: userno,
        });
        console.log(response);
        alert(response.msg);
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.userno !== userno)
        );
      } catch (error) {
        console.log(error);
        alert("삭제가 실패되었습니다.");
      }
    } else {
      alert("취소되었습니다.");
    }
  };

  if (loading) {
    return <div className="admin-loading">로딩 중...</div>;
  }

  return (
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
            <tr key={user.userno}>
              <td>{user.userid}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.joindate}</td>
              <td>
                <button className="action-button update-button">수정</button>
                <button
                  className="action-button delete-button"
                  onClick={() => handleDelete(user.userno)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
      </div>
    </div>
  );
}
