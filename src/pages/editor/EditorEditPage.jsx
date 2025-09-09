// src/pages/editor/EditorEditPage.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import {
  getPostDetail,
  updatePostWithHashtags,
  uploadImageToS3,
} from "../../service/editorAPI";
import axios from "axios";
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

  // 본문 이미지 (단일)
  const [contentImgUrl, setContentImgUrl] = useState("");

  // 해시태그
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // 게시글 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPostDetail(editorno);
        const post = res.data || res;

        setTitle(post.editortitle || "");
        setContent(post.editorcontent || "");
        setThumbnailUrl(post.thumbnailUrl || "");
        setContentImgUrl(post.contentImgUrl || "");

        // 기존 해시태그 불러오기
        setTags(post.hashtags || []);

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

    if (!title?.trim()) return alert("제목을 입력해주세요!");
    if (!thumbnailUrl) return alert("썸네일 이미지를 첨부해주세요!");
    if (!contentImgUrl) return alert("본문 이미지를 업로드해주세요!");
    if (!editorContent?.trim()) return alert("내용을 입력해주세요!");

    const hasImageInEditor = /!\[.*?\]\(.*?\)/.test(editorContent);
    if (!hasImageInEditor)
      return alert("본문에 이미지를 최소 하나 포함해주세요!");

    const requestData = {
      editor: {
        editortitle: title,
        editorcontent: editorContent,
        userno: user?.userno,
        thumbnailUrl,
        contentImgUrl,
      },
      hashtags: tags.map((t) => (typeof t === "string" ? t : t.tagname)), // 문자열 배열로 변환
    };

    try {
      await updatePostWithHashtags(editorno, requestData);
      alert("수정 완료!");
      navigate(`/editor/${editorno}`);
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

  // 해시태그 추가
  const addTag = () => {
    if (!tagInput.trim()) return;
    if (tags.some((t) => (t.tagname || t) === tagInput.trim())) {
      alert("이미 추가된 해시태그입니다.");
      return;
    }
    setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  // 해시태그 삭제
  const removeTag = (tagToRemove) => {
    setTags(
      tags.filter(
        (t) => (t.tagname || t) !== (tagToRemove.tagname || tagToRemove)
      )
    );
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

        {/* 해시태그 */}
        <div className="formGroup">
          <label className="label">해시태그</label>
          <input
            type="text"
            placeholder="해시태그 입력 후 Enter"
            className="input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const newTag = tagInput.trim().replace(/,$/, "");
                if (newTag && !tags.includes(newTag)) {
                  setTags([...tags, newTag]);
                }
                setTagInput("");
              }
            }}
          />
        </div>
        <div className="tag-container">
          {tags.map((tag, idx) => (
            <div key={idx} className="tag-item">
              #{tag}
              <button
                type="button"
                className="tag-remove-btn"
                onClick={() => setTags(tags.filter((t) => t !== tag))}
              >
                ❌
              </button>
            </div>
          ))}
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
                  callback(fileUrl, blob.name);
                  setContentImgUrl(fileUrl);
                } catch (err) {
                  console.error("이미지 업로드 실패:", err);
                  alert("이미지 업로드 실패");
                }
              },
            }}
          />
        </div>

        {/* 본문 이미지 미리보기 */}
        {contentImgUrl && (
          <div className="formGroup">
            <label className="label">본문 이미지</label>
            <div style={{ textAlign: "center" }}>
              <img
                src={contentImgUrl}
                alt="본문 이미지"
                style={{
                  width: 240,
                  height: 160,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
              <button
                type="button"
                className="btn btnMini"
                style={{ marginTop: 6 }}
                onClick={() => setContentImgUrl("")}
              >
                제거
              </button>
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
