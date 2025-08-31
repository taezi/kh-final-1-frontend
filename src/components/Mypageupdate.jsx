import React from "react";
import "../css/MypageUpdate.css";
import { useNavigate } from "react-router-dom";

export default function MypageUpdate({ user }) {
  const navigate = useNavigate();
  const fieldNames = {
    id: "아이디",
    pwd: "비밀번호",
    name: "이름",
    nick: "닉네임",
    email: "이메일",
  };

  const handleUpdate = (field) => {
    const fieldKoreanName = fieldNames[field];
    if (window.confirm(`${fieldKoreanName}을(를) 수정하시겠습니까?`)) {
      console.log(`/update-${field}`);
      navigate(`/update-${field}`);
    }
  };

  return (
    <div className="mypage-update-container">
      <h3>프로필</h3>
      <form>
        <div className="profile-item">
          <div className="item-label">
            <label>ID</label>
            <span className="item-value">{user.userid}</span>
          </div>
          <button
            type="button"
            className="change-button"
            onClick={() => handleUpdate("id")}
          >
            변경
          </button>
        </div>

        {/* 비밀번호 */}
        <div className="profile-item">
          <div className="item-label">
            <label>비밀번호</label>
          </div>
          <button
            type="button"
            className="change-button"
            onClick={() => handleUpdate("pwd")}
          >
            변경
          </button>
        </div>

        {/* 이름 */}
        <div className="profile-item">
          <div className="item-label">
            <label>이름</label>
            <span className="item-value">{user.username}</span>
          </div>
          <button
            type="button"
            className="change-button"
            onClick={() => handleUpdate("name")}
          >
            변경
          </button>
        </div>

        {/* 닉네임 */}
        <div className="profile-item">
          <div className="item-label">
            <label>닉네임</label>
            <span className="item-value">{user.nickname}</span>
          </div>
          <button
            type="button"
            className="change-button"
            onClick={() => handleUpdate("nick")}
          >
            변경
          </button>
        </div>

        {/* 닉네임 */}
        <div className="profile-item">
          <div className="item-label">
            <label>이메일</label>
            <span className="item-value">{user.email}</span>
          </div>
          <button
            type="button"
            className="change-button"
            onClick={() => handleUpdate("email")}
          >
            변경
          </button>
        </div>
      </form>
    </div>
  );
}
