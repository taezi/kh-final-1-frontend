import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../css/EditorPage.css";
import useAuthStore from "../store/authStore";
import { editorAPI } from "../service/editorAPI";

export default function EditorPage(params) {
  const navigate = useNavigate();
  const user = useAuthStore();
  const [editorList, setEditorList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await editorAPI.get("/list");
        setEditorList(response.data.eList); // eList만 꺼내서 state에 저장
      } catch (error) {
        console.error("게시글 조회 실패:", error);
      }
    };
    fetchData();
  }, []);

  const handleClick = () => {
    // EditorWritePage로 이동
    console.log("user", user);
    console.log("userno", user.user.userno);
    navigate("/editorWrite"); // 글 작성 페이지로 이동
  };

  return (
    <Layout>
      <div className="editor-page">
        <h3>에디터페이지</h3>
        <button className="register-btn" onClick={handleClick}>
          등록
        </button>

        {/* 게시글 목록 */}
        <ul>
          {editorList.map((editor) => (
            <li key={editor.editorno}>
              <p>
                <strong>에디터게시글 고유번호:</strong> {editor.editorno}
              </p>
              <p>
                <strong>유저 고유번호:</strong> {editor.userno}
              </p>
              <p>
                <strong>에디터게시글 제목:</strong> {editor.editortitle}
              </p>
              <p>
                <strong>에디터게시글 내용:</strong> {editor.editorcontent}
              </p>
              <p>
                <strong>에디터게시글 작성날짜:</strong> {editor.editordate}
              </p>
              <p>
                <strong>에디터게시글 수정날짜:</strong>{" "}
                {editor.edtiorupdatedate}
              </p>
              <p>
                <strong>에디터게시글 조회수:</strong> {editor.editorview}
              </p>
              <hr />
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
