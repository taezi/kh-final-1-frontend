import Layout from "../../components/Layout";
import "../../css/AdminUserUpdatePage.css";
import { getUserByNo, updateAdminUser } from "../../service/adminAPI";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeroStrip from "../../components/HeroStrip";
import MY_PAGE_HERO from "../../img/my-page.jpg";

export default function AdminUserUpdatePage() {
  const { userno } = useParams();
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    console.log("받은 userno:", userno);

    getUserByNo(userno)
      .then((data) => {
        console.log("API 응답 원본:", data);
        setUser(data);
      })
      .catch((err) => {
        console.error("API 호출 에러:", err);
      });
  }, [userno]);

  if (!user) return <div>로딩 중...</div>;

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
      <div className="mypage-update-container">
        <h3>프로필 수정</h3>
        <form>
          {/* ID */}
          <div className="profile-item">
            <div className="item-label">
              <label>ID</label>
              <span className="item-value">{user.userid}</span>
            </div>
            <button type="button" className="change-button" disabled>
              수정할수없음
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

          {/* 이메일 */}
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
    </Layout>
  );
}
