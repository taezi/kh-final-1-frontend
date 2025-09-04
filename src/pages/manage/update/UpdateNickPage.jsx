import Layout from "../../../components/Layout";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import { useRef } from "react";
import { updateNickname } from "../../../service/manageAPI";
import "../../../css/UpdateNickPage.css"; // CSS 파일 import

export default function UpdateNickPage(params) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);
  const nickname = useRef(null);
  const handleUpdate = async () => {
    if (window.confirm("수정하시겠습니까?")) {
      if (!nickname.current.value.trim()) {
        alert("닉네임 입력란이 비어있습니다. 닉네임을 입력해 주세요.");
        return;
      }

      try {
        const response = await updateNickname(
          user.userid,
          nickname.current.value
        );
        console.log(response);
        if (response.code === 1) {
          alert(response.msg);

          updateUser({ nickname: nickname.current.value });

          navigate(-1);
        } else {
          alert(response.msg);
        }
      } catch (error) {
        console.log("닉네임변경 오류 : ", error);
        alert("닉네임변경에 실패하였습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleCancel = () => {
    if (window.confirm("변경 사항을 취소하시겠습니까?")) {
      alert("변경 사항이 취소되었습니다.");
      navigate(-1);
    }
  };
  return (
    <Layout>
      <div className="update-nick-container">
        {" "}
        {/* 클래스명이 추가된 부분 */}
        <h3>닉네임변경페이지</h3>
        <div className="form-group">
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            ref={nickname}
            placeholder={user.nickname}
          />
        </div>
        <div className="button-group">
          <button
            type="button"
            onClick={handleUpdate}
            className="update-button"
          >
            변경
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
          >
            취소
          </button>
        </div>
      </div>
    </Layout>
  );
}
