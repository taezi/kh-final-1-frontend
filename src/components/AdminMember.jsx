import React, { useState, useEffect } from "react";
import { deleteAdminUser, getUserData } from "../service/adminAPI";
// CSS 파일 import
import "../css/AdminMember.css";

export default function AdminMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("userid");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    getUserData()
      .then((data) => {
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

  const getFilteredUsers = () => {
    if (!searchTerm) {
      return users;
    }

    return users.filter((user) => {
      const searchValue = user[searchFilter];
      if (typeof searchValue === "string") {
        return searchValue.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  };

  const filteredUsers = getFilteredUsers();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const renderPaginationButtons = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          style={{
            margin: "0 5px",
            padding: "5px 10px",
            backgroundColor: currentPage === i ? "#e6f2ff" : "#fff",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (loading) {
    return <div className="admin-loading">로딩 중...</div>;
  }

  return (
    <div className="member-management-section">
      <h2 className="section-title">회원 관리</h2>
      <div className="search-bar">
        <select
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        >
          <option value="userid">회원 ID</option>
          <option value="username">이름</option>
          <option value="email">이메일</option>
        </select>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
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
          {currentItems.length > 0 ? (
            currentItems.map((user) => (
              <tr key={user.userno}>
                <td>{user.userid}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.joindate}</td>
                <td>
                  <div className="action-buttons-container-1">
                    <button className="action-button-1 update-button-1">
                      수정
                    </button>
                    <button
                      className="action-button-1 delete-button-1"
                      onClick={() => handleDelete(user.userno)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                검색된 회원이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">{renderPaginationButtons()}</div>
    </div>
  );
}
