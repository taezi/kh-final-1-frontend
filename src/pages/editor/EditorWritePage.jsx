// src/pages/editor/EditorWritePage.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import {
  createPost,
  saveEditorHashtags,
  uploadImageToS3,
} from "../../service/editorAPI";
import "@toast-ui/editor/toastui-editor.css";
import "../../css/EditorWritePage.css";
import useAuthStore from "../../store/authStore";

import Layout from "../../components/Layout";
import HeroStrip from "../../components/HeroStrip";
import MY_PAGE_HERO from "../../img/my-page.jpg";

export default function EditorWritePage() {
  const user = useAuthStore((state) => state.user);
  const titleRef = useRef(null);
  const editorRef = useRef();
  const navigate = useNavigate();

  // 본문 이미지: 여러 장 가능 → 배열로 관리
  const [contentImgUrls, setContentImgUrls] = useState([]);

  // 썸네일 URL/파일명
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");

  //해쉬태그
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);

  // '내 PC' 버튼
  const handlePcButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 썸네일 업로드 공통 함수 (정확히 400x244 검증)
  const handleThumbnailUpload = async (file) => {
    if (!file) return;

    const allowedWidth = 400;
    const allowedHeight = 244;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = async () => {
      const { width, height } = img;

      if (width !== allowedWidth || height !== allowedHeight) {
        alert(
          `썸네일 이미지는 ${allowedWidth}x${allowedHeight}px이어야 합니다.`
        );
        URL.revokeObjectURL(objectUrl);
        return;
      }

      try {
        const fileUrl = await uploadImageToS3(file);
        setThumbnailUrl(fileUrl);
        setThumbnailName(file.name);
        alert("썸네일 이미지가 첨부되었습니다!");
      } catch (err) {
        console.error(err);
        alert("썸네일 업로드 실패");
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      alert("이미지 파일을 불러오지 못했습니다.");
    };
  };

  // 파일 선택
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleThumbnailUpload(file);
  };

  // DnD 핸들러
  const handleThumbnailDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleThumbnailUpload(files[0]); // 동일 검증 로직 사용
    }
  };

  // 썸네일 삭제
  const handleRemoveThumbnail = () => {
    setThumbnailUrl("");
    setThumbnailName("");
  };

  // 등록
  const handleClickCreateButton = async () => {
    const title = titleRef.current?.value?.trim() || "";

    if (!title) {
      alert("제목을 입력해주세요!");
      return;
    }
    if (!thumbnailUrl) {
      alert("썸네일 이미지를 첨부해주세요!");
      return;
    }
    if (!contentImgUrls.length) {
      alert("에디터 이미지를 최소 하나 업로드해주세요!");
      return;
    }

    const editorInstance = editorRef.current?.getInstance();
    const markdown = editorInstance?.getMarkdown() || "";

    if (!markdown.trim()) {
      alert("내용을 입력해주세요!");
      return;
    }

    // 본문에 실제 이미지가 포함됐는지 검사 (마크다운 이미지 문법)
    const hasImageInEditor = /!\[.*?\]\(.*?\)/.test(markdown);
    if (!hasImageInEditor) {
      alert("에디터 본문에 이미지를 최소 하나 업로드해주세요!");
      return;
    }

    const postData = {
      editortitle: title,
      editorcontent: markdown,
      userno: user.userno,
      // 백엔드 스펙에 맞게 키 사용 (배열 전달)
      contentImgUrls,
      thumbnailUrl,
    };

    try {
      const response = await createPost(postData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log("저장 성공:", response?.data || response);
      const editorno = response?.data?.editorno;
      // 해쉬태그 저장
      if (editorno && tags.length > 0) {
        const postData2 = {
          editorno: editorno,
          hashtags: tags,
        };
        await saveEditorHashtags(postData2);
      }

      alert("등록되었습니다!");
      navigate("/editor");
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 실패입니다");
    }
  };

  // 취소
  const handleClickCancelButton = () => {
    navigate("/editor");
  };

  // dragover/dragenter/drop 바인딩
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("dragenter", handleDragEnter);
    dropZone.addEventListener("drop", handleThumbnailDrop);

    return () => {
      dropZone.removeEventListener("dragover", handleDragOver);
      dropZone.removeEventListener("dragenter", handleDragEnter);
      dropZone.removeEventListener("drop", handleThumbnailDrop);
    };
  }, []);

  return (
    <Layout>
      {/* 상단 히어로 */}
      <HeroStrip
        imageSrc={MY_PAGE_HERO}
        title="에디터 추천 데이트코스 작성"
        subtitle="본문 이미지를 함께 업로드하세요"
        align="left"
        height={600}
        variant="def"
      />

      <div className="editor-container">
        <h2 className="title">에디터 추천 데이트코스</h2>

        {/* 제목 */}
        <div className="formGroup">
          <label className="label">제목</label>
          <input
            type="text"
            ref={titleRef}
            placeholder="제목을 입력하세요"
            className="input"
          />
        </div>

        {/* 썸네일 첨부 */}
        <div className="formGroup">
          <label className="label">썸네일(400x244px)</label>
          <div className="file-attach-container">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="file-attach-buttons">
              <button
                type="button"
                className="attach-button"
                onClick={handlePcButtonClick}
              >
                내 PC
              </button>
            </div>

            <div className="drop-zone" ref={dropZoneRef}>
              {thumbnailName ? (
                <div className="file-item">
                  <span className="file-name">{thumbnailName}</span>
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="remove-button"
                  >
                    X
                  </button>
                </div>
              ) : (
                <p>썸네일용 파일을 마우스로 끌어오세요 (400x244px)</p>
              )}
            </div>

            {thumbnailUrl && (
              <div style={{ marginTop: 10 }}>
                <img
                  src={thumbnailUrl}
                  alt="썸네일 미리보기"
                  style={{ maxWidth: 240, borderRadius: 8 }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 해쉬태그 */}
        <div className="formGroup">
          <label className="label">해쉬태그</label>
          <input
            type="text"
            placeholder="쉼표로 해시태그 입력 (예: 계절, 공원/산책/자연, 문화/예술)"
            className="input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const newTag = tagInput.trim().replace(/,$/, ""); // 쉼표 제거
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
            initialValue=""
            previewStyle="vertical"
            height="460px"
            initialEditType="wysiwyg"
            useCommandShortcut={true}
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
                  const fileUrl = await uploadImageToS3(blob);
                  // 에디터에 즉시 삽입
                  callback(fileUrl, blob.name);
                  // 본문 이미지 배열에 추가(중복 방지)
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

        {/* 본문 이미지 목록 (선택 사항 표시/제거) */}
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

        {/* 액션 버튼 */}
        <div className="buttonGroup">
          <button onClick={handleClickCreateButton} className="btn btnCreate">
            등록
          </button>
          <button onClick={handleClickCancelButton} className="btn btnCancel">
            취소
          </button>
        </div>
      </div>
    </Layout>
  );
}
