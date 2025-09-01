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
  // 에디터 내 첫 번째 이미지 URL
  const [contentImgUrl, setContentImgUrl] = useState("");

  // 변수명 변경: thumbnail -> thumbnailUrl (썸네일)
  // 썸네일 URL과 파일 이름
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailName, setThumbnailName] = useState("");

  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);


  // '내 PC' 버튼 클릭 핸들러
  const handlePcButtonClick = () => {
    fileInputRef.current.click();
  };

  //  썸네일 파일 업로드 공통 로직 (handleFileChange와 handleThumbnailDrop에서 모두 호출)
  const handleThumbnailUpload = async (file) => {
   if (!file) {
    return;
  }

  // 썸네일로 사용할 정확한 가로/세로 픽셀 지정
  const allowedWidth = 400;  
  const allowedHeight = 244; 

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = async () => {
    const { width, height } = img;

    // 가로/세로 픽셀이 정확히 일치하는지 확인
    if (width !== allowedWidth || height !== allowedHeight) {
      alert(`썸네일 이미지는 ${allowedWidth}x${allowedHeight}px이어야 합니다.`);
      URL.revokeObjectURL(img.src);
      return;
    }
      try {
        const fileUrl = await uploadImageToS3(file);
        setThumbnailUrl(fileUrl);
        setThumbnailName(file.name);
        console.log("썸네일 파일 업로드 성공! 파일 이름:", file.name);
        alert("썸네일 이미지가 첨부되었습니다!");
      } catch (err) {
        console.error(err);
        alert("썸네일 업로드 실패");
      }
    }
  };

  // '내 PC'에서 파일 선택 시 (파일 객체를 공통 함수로 전달)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleThumbnailUpload(file);
  };

  // 드래그 앤 드롭 핸들러 (파일 객체를 공통 함수로 전달)
  const handleThumbnailDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleThumbnailUpload(files[0]);
    }
  };

  // 썸네일 파일 삭제 핸들러
  const handleRemoveThumbnail = () => {
    setThumbnailUrl("");
    setThumbnailName("");
  };

  // 등록 버튼 클릭 핸들러
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

  // 취소 버튼 클릭 핸들러
  const handleClickCancelButton = () => {
    navigate("/editor");
    console.log("취소되었습니다");
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
      dropZone.addEventListener("drop", handleThumbnailDrop);

      return () => {
        dropZone.removeEventListener("dragover", handleDragOver);
        dropZone.removeEventListener("dragenter", handleDragEnter);
        dropZone.removeEventListener("drop", handleThumbnailDrop);
      };
    }
  }, []);


  useEffect(() => {
    console.log("마운트");
    return () => console.log("언마운트");
  }, []);

  return (
    <div className="editor-container">
      <h2 className="title">에디터 추천 데이트코스</h2>
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
            {/* <input
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
            /> */}
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
                onClick={() => fileInputRef.current.click()}
              >
                내 PC
              </button>
            </div>
            <div className="drop-zone" ref={dropZoneRef}>
              {thumbnailName ? (
                // 썸네일 이름이 있으면 파일 이름과 삭제 버튼을 보여줌
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
                // 썸네일이 없으면 기본 텍스트를 보여줌
                <p>썸네일용 파일을 마우스로 끌어오세요</p>
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
                  console.log("에디터 이미지 업로드 성공! 파일 URL:", fileUrl);
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
