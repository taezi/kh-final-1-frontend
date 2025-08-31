import Layout from "../../../components/Layout";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import { useRef } from "react";
import { updateUserid } from "../../../service/manageAPI";

export default function UpdateIdPage(params) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const navigate = useNavigate();
  const userid = useRef(null);
  const handleUpdate = async () => {
    if (window.confirm("수정하시겠습니까?")) {
      if (!userid.current.value.trim()) {
        alert("아이디 입력란이 비어있습니다. 아이디를 입력해 주세요.");
        return;
      }

      try {
        const response = await updateUserid(user.userid, userid.current.value);
        console.log(response);
        if (response.code === 1) {
          alert(response.msg);

          updateUser({ userid: userid.current.value });
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
      <h3>아이디 변경</h3>
      <div className="form-group">
        <label htmlFor="userid">아이디</label>
        <input
          type="text"
          id="userid"
          name="userid"
          ref={userid}
          placeholder={user.userid}
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
