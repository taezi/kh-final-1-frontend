import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import defaultImage from "../../img/save-image.png";
import "../../css/EditorDetailPage.css";
import useAuthStore from "../../store/authStore";
import { getPostDetail, deletePost } from "../../service/editorAPI";

export default function EditorDetailPage() {
  const { editorno } = useParams();
  const navigate = useNavigate();
  const [editor, setEditor] = useState(null);
  const currentUser = useAuthStore((state) => state.user);
  console.log(editor);

  // 이미지 태그 추출
  const extractImages = (markdown) => {
    const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      images.push({ alt: match[1], url: match[2] });
    }
    return images;
  };

  // 텍스트만 추출 (이미지 제거)
  const extractText = (markdown) => {
    return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "").trim();
  };

  const images = editor ? extractImages(editor.editorcontent) : [];
  const text = editor ? extractText(editor.editorcontent) : "";

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

  // 마크다운 이미지 변환 함수
  const renderMarkdownImages = (text) => {
    // ![alt](url) → <img src="url" alt="alt" />
    return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
      return `<img src="${url}" alt="${alt}" style="max-width:100%; border-radius:8px;" />`;
    });
  };

  return (
    <Layout>
      <div className="editor-detail-page">
        <h2>에디터 게시글 상세 정보</h2>

        <div className="editor-action-wrapper">
          <button onClick={() => navigate(-1)} className="btnBack">
            목록으로
          </button>
          <div className="editor-action-buttons">
            {currentUser && currentUser.userno === editor.userno && (
              <>
                <button
                  onClick={() => navigate(`/editor/edit/${editor.editorno}`)}
                  className="btnEdit"
                >
                  수정
                </button>
                <button onClick={handleDelete} className="btnDelete">
                  삭제
                </button>
              </>
            )}
          </div>
        </div>

        <div className="editor-meta">
          <p>
            <strong>에디터게시글 고유번호:</strong> {editor.editorno}
          </p>
          <p>
            <strong>유저 고유번호:</strong> {editor.userno}
          </p>
          <p>
            <strong>작성일:</strong> {editor.editordate}
          </p>
          <p>
            <strong>수정일:</strong> {editor.editorupdatedate}
          </p>
          <p>
            <strong>조회수:</strong> {editor.editorview}
          </p>
        </div>

        <div className="editor-detail-item">
          <p className="editor-title">
            <strong>에디터게시글 제목: {editor.editortitle}</strong>
          </p>
          {/* <div className="editor-detail-image">
        <img src={editor.thumbnailUrl || defaultImage} alt={editor.editortitle} />
      </div> */}
          {/* <div className="editor-detail-info">
        <p>에디터게시글 내용: {editor.editorcontent}</p>
      </div> */}

          <div className="editor-detail-container">
            {/* 이미지 영역 */}
            <div className="editor-detail-image">
              {extractImages(editor.editorcontent).map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={img.alt}
                  style={{
                    maxWidth: "100%",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />
              ))}
            </div>

            {/* 글 영역 */}
            <div className="editor-detail-info">
              {extractText(editor.editorcontent) || null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
