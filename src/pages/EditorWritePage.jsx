import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/toastui-editor.css';


export default function EditorWritePage() {
  const titleRef = useRef(null);
  const editorRef = useRef();
  const navigate = useNavigate();
  const [content, setContent] = useState('');

  useEffect(() => {
    console.log('마운트');
    return () => console.log('언마운트');
  }, []);

  const handleClickCreateButton = () => {
    const editorInstance = editorRef.current.getInstance();


    console.log('등록되었습니다', titleRef.current.value, editorInstance.getHTML());
  };

  const handleClickCancleButton = () => {
    navigate('/');
    console.log('취소되었습니다');
  };

  const handleClickImageButton = () => {
    console.log('이미지 버튼 클릭');
  };



  return (
    <div style={styles.container}>
      <h2 style={styles.title}>에디터 추천 데이트코스 작성 페이지</h2>

      <div>
        <div style={styles.formGroup}>
          <label style={styles.label}>제목</label>
          <input
            type="text"
            ref={titleRef}
            placeholder="제목을 입력하세요"
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>내용</label>
           <Editor
        initialValue="저장합니다."
        previewStyle="vertical"  // vertical 또는 tab
        height="400px"
        initialEditType="wysiwyg" // markdown 또는 wysiwyg
        useCommandShortcut={true} // 단축키 사용 여부
      toolbarItems={[
        ['heading', 'bold', 'italic', 'strike', 'code', 'quote', 'ul', 'ol', 'task', 'indent', 'outdent', 'table', 'link', 'image', 'codeblock', 'scrollSync']
      ]}
        ref={editorRef}/>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={handleClickCreateButton}
            style={{ ...styles.btn, ...styles.btnCreate }}
          >
            등록
          </button>
          <button
            onClick={handleClickCancleButton}
            style={{ ...styles.btn, ...styles.btnCancel }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}


  // 스타일 객체
  const styles = {
    container: {
      maxWidth: '700px',
      margin: '40px auto',
      padding: '20px',
      fontFamily: "'Noto Sans KR', sans-serif",
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    title: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '30px'
    },
    formGroup: {
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '8px',
      fontWeight: 'bold',
      color: '#555'
    },
    input: {
      padding: '10px 15px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '16px',
      width: '100%',
      boxSizing: 'border-box'
    },
    textarea: {
      padding: '10px 15px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '16px',
      width: '100%',
      minHeight: '150px',
      marginTop: '8px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    btn: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer'
    },
    btnCreate: {
      backgroundColor: '#1E90FF',
      color: '#fff'
    },
    btnCancel: {
      backgroundColor: '#f44336',
      color: '#fff'
    },
    btnImage: {
      backgroundColor: '#4CAF50',
      color: '#fff',
      padding: '6px 12px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'center', // 등록/취소 버튼 가운데 정렬
      gap: '10px',
      marginTop: '20px'
    },
    imageButtonWrapper: {
      display: 'flex',
      justifyContent: 'flex-end', // 이미지 버튼 오른쪽 끝
      marginBottom: '8px'
    }
  };