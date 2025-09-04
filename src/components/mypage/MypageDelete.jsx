import React, { useRef } from "react";
import "../../css/MypageDelete.css";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { deleteUser } from "../../service/manageAPI";

export default function MypageDelete() {
  const password = useRef(null);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();
  const handleDelete = async () => {
    try {
      const response = await deleteUser({
        userid: user.userid,
        password: password.current.value,
      });
      console.log(response);

      alert(response.msg);

      // 성공했을 때만 메인으로 이동
      if (response.code === 1) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("auth-storage");
        logout();
        navigate("/");
      }
    } catch (error) {
      console.log("회원 탈퇴 실패 : ", error);
      alert("회원 탈퇴에 실패하였습니다. 다시 시도해주세요.");
    }
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
          ref={password}
          placeholder="비밀번호를 입력하세요"
        />
      </div>
      <button type="button" onClick={handleDelete} className="delete-button">
        탈퇴
      </button>
    </div>
  );
}
