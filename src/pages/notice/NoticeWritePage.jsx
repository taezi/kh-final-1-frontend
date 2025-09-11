import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/toastui-editor.css";
import "../../css/NoticeWritePage.css";
import useAuthStore from "../../store/authStore";
import { createNotice } from "../../service/noticeAPI";

export default function NoticeWritePage() {
  const user = useAuthStore((state) => state.user); // ✅ user 가져오기
  const titleRef = useRef(null);
  const contentRef = useRef();
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

    const contentInstance = contentRef.current.getInstance();
    const postData = {
      noticetitle: titleRef.current.value,
      // editorcontent: editorInstance.getHTML(),
      noticepost: contentInstance.getMarkdown(), // HTML 대신 마크다운
      userno: user.userno,
    };

    try {
      const response = await createNotice(postData);
      console.log("저장 성공:", response.data);
      alert("등록되었습니다!");
      navigate("/notice");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 실패입니다");
    }
  };

  const handleClickCancelButton = () => {
    navigate("/notice");
    console.log("취소되었습니다");
  };

  return (
    <div className="editor-container">
      <h2 className="title">공지사항 작성 페이지</h2>
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
            ref={contentRef}
            initialValue="공지사항 작성 페이지"
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
                "codeblock",
                "scrollSync",
              ],
            ]}
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
