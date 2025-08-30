import React from "react";
import "../css/MypageUpdate.css"; 

export default function MypageUpdate() {
  const handleUpdate = () => {
    if (window.confirm("수정하시겠습니까?")) {
      alert("수정이 완료되었습니다.");
    }
  };

  const handleCancel = () => {
    if (window.confirm("변경 사항을 취소하시겠습니까?")) {
      alert("변경 사항이 취소되었습니다.");
    }
  };

  return (
    <div className="mypage-update-container">
      <h3>내 정보 수정</h3>
      <form>
        <div className="form-group">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="이름을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">아이디</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="아이디를 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="새 비밀번호를 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 재입력</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            placeholder="닉네임을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="이메일을 입력하세요"
          />
        </div>
        <div className="button-group">
          <button
            type="button"
            onClick={handleUpdate}
            className="update-button"
          >
            수정
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
