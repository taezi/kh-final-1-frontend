import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import { createPost } from "../service/editorAPI";
import "@toast-ui/editor/toastui-editor.css";
import "../css/EditorWritePage.css";
import useAuthStore from "../store/authStore";

export default function EditorWritePage() {
  const user = useAuthStore((state) => state.user); // ✅ user 가져오기
  const titleRef = useRef(null);
  const editorRef = useRef();
  const navigate = useNavigate();
  const [content, setContent] = useState("");

  useEffect(() => {
    console.log("마운트");
    return () => console.log("언마운트");
  }, []);

  //등록 버튼 실패시 사용
  // 등록 버튼 클릭
  const handleClickCreateButton = async () => {
    console.log("버튼 클릭 확인");

    const editorInstance = editorRef.current.getInstance();
    const postData = {
      editortitle: titleRef.current.value,
      // editorcontent: editorInstance.getHTML(),
      editorcontent: editorInstance.getMarkdown(), // HTML 대신 마크다운
      userno: user.userno,
    };

    try {
      const response = await createPost(postData);
      console.log("저장 성공:", response.data);
      alert("등록되었습니다!");
      navigate("/editor");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 실패입니다");
    }
  };

  const handleClickCancelButton = () => {
    navigate("/editor");
    console.log("취소되었습니다");
  };

  return (
    <div className="editor-container">
      <h2 className="title">에디터 추천 데이트코스 작성 페이지</h2>
      <div>
        <div className="formGroup">
          <label className="label">제목</label>
          <input
            type="text"
            ref={titleRef}
            placeholder="제목을 입력하세요"
            className="input"
          />
        </div>
        <div className="formGroup">
          <label className="label">내용</label>
          <Editor
            initialValue="에디터작성페이지"
            previewStyle="vertical" // vertical 또는 tab
            height="400px"
            initialEditType="wysiwyg" // markdown 또는 wysiwyg
            useCommandShortcut={true} // 단축키 사용 여부
            toolbarItems={[
              [
                "heading",
                "bold",
                "italic",
                "strike",
                "code",
                "quote",
                "ul",
                "ol",
                "task",
                "table",
                "image",
                "codeblock",
                "scrollSync",
              ],
            ]}
            ref={editorRef}
            hooks={{
              addImageBlobHook: async (blob, callback) => {
                try {
                  // 1. FormData에 이미지 담기
                  const formData = new FormData();
                  formData.append("file", blob);

                  // 2. 서버에 업로드 요청 (S3 등)
                  const res = await fetch(
                    "http://localhost:9999/api/editor/upload",
                    {
                      method: "POST",
                      body: formData,
                    }
                  );
                  const data = await res.json();

                  // 3. S3 URL을 에디터에 삽입
                  callback(data.url, "이미지");
                } catch (err) {
                  console.error("이미지 업로드 실패:", err);
                }
              },
            }}
          />
        </div>

        <div className="buttonGroup">
          <button onClick={handleClickCreateButton} className="btn btnCreate">
            등록
          </button>
          <button onClick={handleClickCancelButton} className="btn btnCancel">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
