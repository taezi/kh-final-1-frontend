import React from "react";
import "../css/MypageDelete.css";

export default function MypageDelete() {
  const handleDelete = () => {
    alert("탈퇴되었습니다.");
  };

  return (
    <div className="mypage-delete-container">
      <h3>회원 탈퇴</h3>
      <div className="warning-section">
        <p>회원 탈퇴 시 모든 데이터가 삭제됩니다.</p>
      </div>
      <div className="form-group">
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="비밀번호를 입력하세요"
        />
      </div>
      <button type="button" onClick={handleDelete} className="delete-button">
        탈퇴
      </button>
    </div>
  );
}
