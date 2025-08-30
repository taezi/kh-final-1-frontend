import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@toast-ui/react-editor";
import { createPost, uploadImageToS3 } from "../../service/editorAPI";
import "@toast-ui/editor/toastui-editor.css";
import "../../css/EditorWritePage.css";
import useAuthStore from "../../store/authStore";

export default function EditorWritePage() {
  const user = useAuthStore((state) => state.user);
  const titleRef = useRef(null);
  const editorRef = useRef();
  const navigate = useNavigate();

  // 변수명 변경: thumbnailUrl -> contentImgUrl (에디터 이미지)
  const [contentImgUrl, setContentImgUrl] = useState("");

  // 변수명 변경: thumbnail -> thumbnailUrl (썸네일)
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);

  // 드래그 앤 드롭 파일 처리 (썸네일 전용)
  const handleThumbnailDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      try {
        const fileUrl = await uploadImageToS3(file);
        setThumbnailUrl(fileUrl); // 변수명 변경
        alert("썸네일 이미지가 첨부되었습니다!");
      } catch (err) {
        console.error(err);
        alert("썸네일 업로드 실패");
      }
    }
  };

  // dragover 이벤트 처리 (썸네일 전용)
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (dropZone) {
      const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
      const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
      const handleDrop = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const files = event.dataTransfer.files;
        if (files.length > 0) {
          const file = files[0];
          try {
            const fileUrl = await uploadImageToS3(file);
            setThumbnailUrl(fileUrl); // 변수명 변경
            alert("썸네일 이미지가 첨부되었습니다!");
          } catch (err) {
            console.error(err);
            alert("썸네일 이미지 업로드 실패");
          }
        }
      };

      dropZone.addEventListener("dragover", handleDragOver);
      dropZone.addEventListener("dragenter", handleDragEnter);
      dropZone.addEventListener("drop", handleDrop);

      return () => {
        dropZone.removeEventListener("dragover", handleDragOver);
        dropZone.removeEventListener("dragenter", handleDragEnter);
        dropZone.removeEventListener("drop", handleDrop);
      };
    }
  }, []);

  useEffect(() => {
    console.log("마운트");
    return () => console.log("언마운트");
  }, []);

  const handleClickCreateButton = async () => {
    if (!titleRef.current.value) {
      alert("제목을 입력해주세요!");
      return;
    }
    if (!thumbnailUrl) {
      // 변수명 변경
      alert("썸네일 이미지를 첨부해주세요!");
      return;
    }
    if (!contentImgUrl) {
      // 변수명 변경
      alert("에디터 이미지를 최소 하나 업로드해주세요!");
      return;
    }

    const editorInstance = editorRef.current.getInstance();

    const postData = {
      editortitle: titleRef.current.value,
      editorcontent: editorInstance.getMarkdown(),
      userno: user.userno,
      contentImgUrl, // 변수명 변경
      thumbnailUrl, // 변수명 변경
    };

    console.log("등록 데이터(postData):", postData);

    try {
      const response = await createPost(postData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
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
          <label className="label">파일 첨부</label>
          <div className="file-attach-container">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={async (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                  const file = files[0];
                  try {
                    const fileUrl = await uploadImageToS3(file);
                    setThumbnailUrl(fileUrl); // 변수명 변경
                    alert("썸네일 이미지가 첨부되었습니다!");
                  } catch (err) {
                    console.error(err);
                    alert("썸네일 이미지 업로드에 실패했습니다.");
                  }
                }
              }}
            />
            <div className="file-attach-buttons">
              <button
                type="button"
                className="attach-button"
                onClick={() => fileInputRef.current.click()}
              >
                내 PC
              </button>
            </div>
            <div className="drop-zone" ref={dropZoneRef}>
              <p> 썸네일용 파일을 마우스로 끌어오세요</p>
              {thumbnailUrl && ( // 변수명 변경
                <img
                  src={thumbnailUrl} // 변수명 변경
                  alt="썸네일 미리보기"
                  style={{ marginTop: "10px", maxWidth: "200px" }}
                />
              )}
            </div>
          </div>
        </div>
        <div className="formGroup">
          <label className="label">내용</label>
          <Editor
            initialValue="에디터작성페이지"
            previewStyle="vertical"
            height="400px"
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
                  callback(fileUrl, blob.name);
                  if (!contentImgUrl) {
                    // 변수명 변경
                    setContentImgUrl(fileUrl); // 변수명 변경
                  }
                } catch (err) {
                  console.error("이미지 업로드 실패:", err);
                }
              },
            }}
          />
        </div>
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
  );
}
