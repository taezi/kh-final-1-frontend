import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import {
  getPostDetail,
  updatePost,
  uploadImageToS3,
} from "../../service/editorAPI";
import "@toast-ui/editor/toastui-editor.css";
import "../../css/EditorWritePage.css";
import useAuthStore from "../../store/authStore";
import Layout from "../../components/Layout";

export default function EditorEditPage() {
  const { editorno } = useParams();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const editorRef = useRef();

  const [title, setTitle] = useState(""); // 제목
  const [content, setContent] = useState(""); // 내용
  const [loading, setLoading] = useState(true); // 로딩 상태

  // 썸네일 이미지
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  // 본문 이미지
  const [contentImgUrl, setContentImgUrl] = useState("");

  // 게시글 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPostDetail(editorno);
        const post = res.data || res;

        setTitle(post.editortitle);
        setContent(post.editorcontent);
        setThumbnailUrl(post.thumbnailUrl || "");
        setContentImgUrl(post.contentImgUrl || ""); // 기존 본문 이미지 배열
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

     const editorContent = editorInstance.getMarkdown();
    // 제목이 없을 경우 경고창
  if (!title) {
    alert("제목을 입력해주세요!");
    return;
  }
  
  // 썸네일 이미지가 없을 경우 경고창
  if (!thumbnailUrl) {
    alert("썸네일 이미지를 첨부해주세요!");
    return;
  }
  
  // 본문(에디터) 이미지가 없을 경우 경고창
  if (!contentImgUrl) {
    alert("에디터 이미지를 최소 하나 업로드해주세요!");
    return;
  }
  
  // 본문(에디터) 내용이 없을 경우 경고창
  if (!editorInstance.getMarkdown()) {
    alert("내용을 입력해주세요!");
    return;
  }
  
  // 본문(에디터) 내에 이미지가 없을 경우 경고창
  // Markdown 이미지 형식( ![alt](url) )이 포함되어 있는지 확인합니다.
  const hasImageInEditor = /!\[.*?\]\(.*?\)/.test(editorContent);
  if (!hasImageInEditor) {
    alert("에디터 본문에 이미지를 최소 하나 업로드해주세요!");
    return;
  }
    
    const postData = {
      editortitle: title,
      editorcontent: editorInstance.getMarkdown(),
      userno: user.userno,
      thumbnailUrl, // 새로 업로드했으면 최신 URL, 아니면 기존 값
      contentImgUrl, // 배열 통째로 교체
    };

    console.log("업데이트 전송 데이터:", postData);

    try {
      await updatePost(editorno, postData);
      alert("수정 완료!");
      navigate("/editor", { replace: true });
    } catch (err) {
      console.error("수정 실패", err);
      alert("수정 실패");
    }
  };

  // 취소
  const handleCancel = () => {
    navigate("/editor");
  };

  // 썸네일 수동 업로드 (버튼으로)
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileUrl = await uploadImageToS3(file);
      setThumbnailUrl(fileUrl);
      alert("썸네일 이미지 업로드 성공!");
    } catch (err) {
      console.error(err);
      alert("썸네일 업로드 실패");
    }
  };

  if (loading) return <p>로딩중...</p>;

  return (
    <Layout>
      <div className="editor-container">
        <h2 className="title">에디터 게시글 수정</h2>

        {/* 제목 */}
        <div className="formGroup">
          <label className="label">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
        </div>

        {/* 썸네일 */}
        <div className="formGroup">
          <label className="label">썸네일 이미지</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
          />
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="썸네일 미리보기"
              style={{ marginTop: "10px", maxWidth: "200px" }}
            />
          )}
        </div>

        {/* 내용 */}
        <div className="formGroup">
          <label className="label">내용</label>
          <Editor
            previewStyle="vertical"
            height="400px"
            initialEditType="wysiwyg"
            useCommandShortcut={true}
            ref={editorRef}
            key={content}
            initialValue={content || "내용을 입력하세요"}
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
            hooks={{
              addImageBlobHook: async (blob, callback) => {
                try {
                  const fileUrl = await uploadImageToS3(blob);
                  callback(fileUrl, blob.name);

                  // 본문 이미지 배열에 추가
                  setContentImgUrl(fileUrl);
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
