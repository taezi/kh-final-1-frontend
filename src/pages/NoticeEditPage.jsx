import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import Layout from "../components/Layout";
import { getNoticeDetail, updateNotice } from "../service/noticeAPI";
import "@toast-ui/editor/dist/toastui-editor.css";
import "../css/NoticeWritePage.css"; // EditorEditPage와 동일 UI를 위해

export default function NoticeEditPage() {
  const { noticeno } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // 공지사항 상세 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getNoticeDetail(noticeno);
        const notice = res.data || res;
        setTitle(notice.noticetitle);
        setContent(notice.noticepost);
        setLoading(false);
      } catch (err) {
        console.error("공지사항 불러오기 실패", err);
        alert("공지사항 불러오기 실패");
        navigate("/notice");
      }
    };
    fetchData();
  }, [noticeno, navigate]);

  // 수정 완료
  const handleUpdate = async () => {
    const editorInstance = editorRef.current.getInstance();
    const postData = {
      noticetitle: title,
      noticepost: editorInstance.getMarkdown(),
    };

    try {
      await updateNotice(noticeno, postData);
      alert("수정 완료!");
      navigate("/notice");
    } catch (err) {
      console.error("수정 실패", err);
      alert("수정 실패");
    }
  };

  // 취소
  const handleCancel = () => {
    navigate("/notice");
  };

  if (loading) return <p>로딩중...</p>;

  return (
    <Layout>
      <div className="editor-container"> {/* EditorEditPage와 동일 UI */}
        <h2 className="title">공지사항 수정</h2>

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
            key={content} // content가 바뀔 때마다 Editor 리렌더
            initialValue={content}
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