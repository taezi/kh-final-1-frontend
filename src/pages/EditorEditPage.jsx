import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import {
  getPostDetail,
  updatePost,
  uploadImageToS3,
} from "../service/editorAPI";
import "@toast-ui/editor/toastui-editor.css";
import "../css/EditorWritePage.css";
import useAuthStore from "../store/authStore";
import Layout from "../components/Layout";

export default function EditorEditPage() {
  const { editorno } = useParams();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const editorRef = useRef();

  const [title, setTitle] = useState(""); // 제목 상태
  const [content, setContent] = useState(""); // 내용 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [fileUrl, setFileUrl] = useState(null); // 업로드된 이미지 URL 상태

  // 게시글 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPostDetail(editorno);
        const post = res.data || res; // res 구조에 맞게 조정

        setTitle(post.editortitle);
        setContent(post.editorcontent);
        setLoading(false);
      } catch (err) {
        console.error("불러오기 실패", err);
        alert("게시글 불러오기 실패");
        navigate("/editor");
      }
    };
    fetchData();
  }, [editorno, navigate]);

  // 수정 완료
  const handleUpdate = async () => {
    const editorInstance = editorRef.current.getInstance();

    const postData = {
      editortitle: title,
      editorcontent: editorInstance.getMarkdown(),
      userno: user.userno,
    };

    console.log("업데이트 전송 데이터:", postData);
    try {
      await updatePost(editorno, postData);
      alert("수정 완료!");
      navigate("/editor"); // ← 여기를 리스트 페이지로
    } catch (err) {
      console.error("수정 실패", err);
      alert("수정 실패");
    }
  };

  // 취소
  const handleCancel = () => {
    navigate("/editor"); // 상세 페이지 대신 리스트로
  };

  if (loading) return <p>로딩중...</p>;

  return (
    <Layout>
<div className="editor-container">
      <h2 className="title">에디터 게시글 수정</h2>

      <div className="formGroup">
        <label className="label">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </div>

      <div className="formGroup">
        <label className="label">내용</label>
        <Editor
          previewStyle="vertical"
          height="400px"
          initialEditType="wysiwyg"
          useCommandShortcut={true}
          ref={editorRef}
          key={content} // content가 바뀔 때마다 Editor를 리렌더
          initialValue={content}
          hooks={{
            addImageBlobHook: async (blob, callback) => {
              try {
                const fileUrl = await uploadImageToS3(blob); // service 활용
              } catch (err) {
                console.error("이미지 업로드 실패:", err);
              }
            },
          }}
        />
      </div>

      <div className="buttonGroup">
        <button onClick={handleUpdate} className="btn btnCreate">
          수정 완료
        </button>
        <button onClick={handleCancel} className="btn btnCancel">
          취소
        </button>
      </div>
  
    </div>
    </Layout>
    
  );
}
