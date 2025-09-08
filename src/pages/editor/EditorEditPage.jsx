// src/pages/editor/EditorEditPage.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import {
  getPostDetail,
  saveEditorHashtags,
  updatePost,
  uploadImageToS3,
} from "../../service/editorAPI";
import "@toast-ui/editor/toastui-editor.css";
import "../../css/EditorWritePage.css";
import useAuthStore from "../../store/authStore";
import Layout from "../../components/Layout";
import HeroStrip from "../../components/HeroStrip";
import MY_PAGE_HERO from "../../img/my-page.jpg";

export default function EditorEditPage() {
  const { editorno } = useParams();
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const editorRef = useRef();

  // 제목/내용/로딩
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // 썸네일 (단일)
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // 본문 이미지 (여러 장 → 배열로 관리)
  const [contentImgUrls, setContentImgUrls] = useState([]);

  // 게시글 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPostDetail(editorno);
        const post = res.data || res;

        setTitle(post.editortitle || "");
        setContent(post.editorcontent || "");

        // 썸네일
        setThumbnailUrl(post.thumbnailUrl || "");

        // 본문 이미지 배열
        // 서버가 문자열/단일값을 줄 가능성도 고려해서 배열로 정규화
        if (Array.isArray(post.contentImgUrl)) {
          setContentImgUrls(post.contentImgUrl);
        } else if (post.contentImgUrl) {
          setContentImgUrls([post.contentImgUrl]);
        } else if (Array.isArray(post.contentImgUrls)) {
          setContentImgUrls(post.contentImgUrls);
        } else {
          setContentImgUrls([]);
        }

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
    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) {
      alert("에디터가 아직 준비되지 않았습니다.");
      return;
    }

    const editorContent = editorInstance.getMarkdown();

    if (!title?.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }

    if (!thumbnailUrl) {
      alert("썸네일 이미지를 첨부해주세요!");
      return;
    }

    if (!contentImgUrls || contentImgUrls.length === 0) {
      alert("에디터 이미지를 최소 하나 업로드해주세요!");
      return;
    }

    if (!editorContent?.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    // 에디터 본문 내 이미지 존재 여부 체크 (Markdown 이미지 문법)
    const hasImageInEditor = /!\[.*?\]\(.*?\)/.test(editorContent);
    if (!hasImageInEditor) {
      alert("에디터 본문에 이미지를 최소 하나 업로드해주세요!");
      return;
    }

    const postData = {
      editortitle: title,
      editorcontent: editorContent,
      userno: user?.userno,
      thumbnailUrl,
      // 백엔드에 배열로 전달 (필드명은 서버 스펙에 맞춰 주세요)
      contentImgUrls,
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

  // 썸네일 수동 업로드
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
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
      {/* ✅ HeroStrip 상단 배너 */}
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title="에디터 게시글 수정"
        subtitle="이미지 업로드와 내용을 수정한 뒤 저장하세요"
        align="left"
        height={600}
        variant="def"
      />

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
            placeholder="제목을 입력하세요"
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
              style={{ marginTop: 10, maxWidth: 240, borderRadius: 8 }}
            />
          )}
        </div>

        {/* 내용 */}
        <div className="formGroup">
          <label className="label">내용</label>
          <Editor
            previewStyle="vertical"
            height="480px"
            initialEditType="wysiwyg"
            useCommandShortcut={true}
            ref={editorRef}
            // initialValue는 최초 1회만 반영되므로 key로 강제 리마운트
            key={content ? `content-${editorno}` : `empty-${editorno}`}
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
                  // 에디터에 즉시 삽입
                  callback(fileUrl, blob.name);

                  // 본문 이미지 배열에 추가 (중복 방지)
                  setContentImgUrls((prev) =>
                    prev.includes(fileUrl) ? prev : [...prev, fileUrl]
                  );
                } catch (err) {
                  console.error("이미지 업로드 실패:", err);
                  alert("이미지 업로드 실패");
                }
              },
            }}
          />
        </div>

        {/* 본문 이미지 목록(선택 표시용) */}
        {contentImgUrls.length > 0 && (
          <div className="formGroup">
            <label className="label">본문 이미지 목록</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {contentImgUrls.map((url, idx) => (
                <div key={idx} style={{ textAlign: "center" }}>
                  <img
                    src={url}
                    alt={`content-${idx}`}
                    style={{
                      width: 120,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 6,
                      display: "block",
                    }}
                  />
                  <button
                    type="button"
                    className="btn btnMini"
                    style={{ marginTop: 6 }}
                    onClick={() =>
                      setContentImgUrls((prev) => prev.filter((u) => u !== url))
                    }
                  >
                    제거
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
