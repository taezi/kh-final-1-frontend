import Layout from "../../../components/Layout";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import { useRef } from "react";
import { updateUsername } from "../../../service/manageAPI";
import "../../../css/UpdateNamePage.css"; // CSS 파일 import
import HeroStrip from "../../../components/HeroStrip";
import MY_PAGE_HERO from "../../../img/my-page.jpg";

export default function UpdateNamePage(params) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);
  const username = useRef(null);
  const handleUpdate = async () => {
    if (window.confirm("수정하시겠습니까?")) {
      if (!username.current.value.trim()) {
        alert("이름 입력란이 비어있습니다. 이름을 입력해 주세요.");
        return;
      }

      try {
        const response = await updateUsername(
          user.userid,
          username.current.value
        );
        console.log(response);
        if (response.code === 1) {
          alert(response.msg);

          updateUser({ username: username.current.value });

          navigate(-1);
        } else {
          alert(response.msg);
        }
      } catch (error) {
        console.log("이름변경 오류 : ", error);
        alert("이름변경에 실패하였습니다. 다시 시도해주세요.");
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
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title="관리자 페이지"
        subtitle="내용을 수정한 뒤 저장하세요"
        align="left"
        height={600}
        variant="def"
      />
      <div className="update-name-container">
        {" "}
        {/* 클래스명이 추가된 부분 */}
        <h3>이름변경페이지</h3>
        <div className="form-group">
          <label htmlFor="username">이름</label>
          <input
            type="text"
            id="username"
            name="username"
            ref={username}
            placeholder={user.username}
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
