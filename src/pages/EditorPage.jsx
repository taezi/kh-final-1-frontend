import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../css/EditorPage.css";

export default function EditorPage(params) {
    const navigate = useNavigate();
  
     const handleClick = () => {
      // EditorWritePage로 이동
    navigate("/editorWrite"); 
  };

  
  return (
    <Layout>
      <div className="editor-page">
        <h3>에디터페이지</h3>
        <button className="register-btn" onClick={handleClick}>
          등록
        </button>
      </div>
    </Layout>
  );
}
