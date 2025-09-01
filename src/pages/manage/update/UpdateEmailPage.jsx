import Layout from "../../../components/Layout";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import { useRef } from "react";
import { updateEmail } from "../../../service/manageAPI";

export default function UpdateEmailPage(params) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);
  const email = useRef(null);

  const handleUpdate = async () => {
    if (window.confirm("수정하시겠습니까?")) {
      if (!email.current.value.trim()) {
        alert("이메일 입력란이 비어있습니다. 이메일을 입력해 주세요.");
        return;
      }

      try {
        const response = await updateEmail(user.userid, email.current.value);
        console.log(response);
        if (response.code === 1) {
          alert(response.msg);
          updateUser({ email: email.current.value });
          navigate(-1);
        } else {
          alert(response.msg);
        }
      } catch (error) {
        console.log("이메일변경 오류 : ", error);
        alert("이메일변경에 실패하였습니다. 다시 시도해주세요.");
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
      <h3>이메일변경페이지</h3>
      <div className="form-group">
        <label htmlFor="email">이메일</label>
        <input
          type="text"
          id="email"
          name="email"
          ref={email}
          placeholder={user.email}
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
