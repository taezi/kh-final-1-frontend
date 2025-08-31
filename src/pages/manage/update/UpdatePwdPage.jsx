import Layout from "../../../components/Layout";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import { useRef } from "react";
import { updatePassword } from "../../../service/manageAPI";

export default function UpdatePwdPage(params) {
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();
  const beforePassowrd = useRef(null);
  const afterPassowrd = useRef(null);
  const confirmPassowrd = useRef(null);

  const handleUpdate = async () => {
    if (window.confirm("수정하시겠습니까?")) {
      if (!beforePassowrd.current.value.trim()) {
        alert(
          "현재 비밀번호 입력란이 비어있습니다. 현재 비밀번호을 입력해 주세요."
        );
        return;
      }
      if (!afterPassowrd.current.value.trim()) {
        alert(
          "새 비밀번호 입력란이 비어있습니다. 새 비밀번호을 입력해 주세요."
        );
        return;
      }
      if (!confirmPassowrd.current.value.trim()) {
        alert(
          "새 비밀번호 확인 입력란이 비어있습니다. 새 비밀번호을 다시 입력해 주세요."
        );
        return;
      }

      if (afterPassowrd.current.value !== confirmPassowrd.current.value) {
        alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
      }

      try {
        const response = await updatePassword(
          user.userid,
          beforePassowrd.current.value,
          afterPassowrd.current.value
        );
        console.log(response);
        if (response.code === 1) {
          alert(response.msg);
          useAuthStore.getState().logout();

          navigate("/login");
        } else {
          alert(response.msg);
        }
      } catch (error) {
        console.log("아이디변경 오류 : ", error);
        alert("아이디변경에 실패하였습니다. 다시 시도해주세요.");
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
      <h3>비밀번호변경페이지</h3>
      <div className="form-group">
        <label htmlFor="before-password">현재 비밀번호</label>
        <input
          type="password"
          id="before-password"
          name="before-password"
          ref={beforePassowrd}
          placeholder="현재 비밀번호를 입력하세요"
        />
      </div>
      <div className="form-group">
        <label htmlFor="after-password">새 비밀번호</label>
        <input
          type="password"
          id="after-password"
          name="after-password"
          ref={afterPassowrd}
          placeholder="새 비밀번호를 입력하세요"
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirm-password">새 비밀번호 확인</label>
        <input
          type="password"
          id="confirm-password"
          name="confirm-password"
          ref={confirmPassowrd}
          placeholder="새 비밀번호를 다시 입력하세요"
        />
      </div>
      <div className="button-group">
        <button type="button" onClick={handleUpdate} className="update-button">
          변경
        </button>
        <button type="button" onClick={handleCancel} className="cancel-button">
          취소
        </button>
      </div>
    </Layout>
  );
}
