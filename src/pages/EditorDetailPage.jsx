import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import defaultImage from "../img/editor.png";
import "../css/EditorDetailPage.css";
import useAuthStore from "../store/authStore";
import { getPostDetail, deletePost } from "../service/editorAPI";

export default function EditorDetailPage() {
  const { editorno } = useParams();
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchEditor = async () => {
      try {
        const data = await getPostDetail(editorno);
        setEditor(data);
      } catch (error) {
        console.error("상세 조회 실패:", error);
      }
    };
    fetchEditor();
  }, [editorno]);

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deletePost(editorno);
        alert("삭제되었습니다.");
        navigate("/editor");
      } catch (error) {
        console.error("삭제 실패:", error);
        alert("삭제 실패");
      }
    }
  };

  if (!editor) return <p>로딩중...</p>;

  return (
    <Layout>
      <div className="editor-detail-page">
        <h2>에디터 게시글 상세 정보</h2>

        <div className="editor-action-buttons">
          {currentUser && currentUser.userno === editor.userno && (
            <>
              <button onClick={handleDelete} className="btnDelete">
                삭제
              </button>
              <button
                onClick={() => navigate(`/editor/edit/${editor.editorno}`)}
                className="btnEdit"
              >
                수정
              </button>
            </>
          )}
        </div>

        <div className="editor-detail-item">
          <div className="editor-detail-image">
            <img src={editor.thumbnail || defaultImage} alt={editor.editortitle} />
          </div>
          <div className="editor-detail-info">
            <p><strong>에디터게시글 고유번호:</strong> {editor.editorno}</p>
            <p><strong>유저 고유번호:</strong> {editor.userno}</p>
            <p><strong>에디터게시글 제목:</strong> {editor.editortitle}</p>
            <p><strong>에디터게시글 내용:</strong> {editor.editorcontent}</p>
            <p><strong>작성일:</strong> {editor.editordate}</p>
            <p><strong>수정일:</strong> {editor.editorupdatedate}</p>
            <p><strong>조회수:</strong> {editor.editorview}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}