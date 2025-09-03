import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { useRef } from "react";
import { createInquiryReply } from "../../../service/manageAPI";
import "../../../css/InquiryReplyPage.css";

export default function InquiryReplyPage(params) {
  const { inquiryno } = useParams();
  const replyContent = useRef();
  const navigate = useNavigate();

  console.log("문의글번호(답변) : ", inquiryno);
  const handleClickCancelButton = () => {
    console.log("취소되었습니다");
    navigate(-1);
  };

  const handleClickCreateButton = async () => {
    console.log("문의글번호(댭변) : ", inquiryno);
    console.log("문의글내용(답변) :", replyContent.current.value);
    const replyData = {
      inquiryno: inquiryno,
      replyContent: replyContent.current.value,
    };

    const response = await createInquiryReply(replyData);
    console.log("등록되었습니다");
    navigate(-1);
  };
  return (
    <Layout>
      <h3>1:1문의 관리자 답변 페이지</h3>
      <form
        className="inquiry-form"
        onSubmit={(e) => {
          e.preventDefault(); // 새로고침 방지
          handleClickCreateButton();
        }}
      >
        <div className="form-group">
          <label htmlFor="replyContent">내용</label>
          <textarea
            id="replyContent"
            name="replyContent"
            rows="10"
            ref={replyContent}
            required
          ></textarea>
        </div>
        <div className="button-group">
          <button type="submit" className="submit-button">
            등록
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={handleClickCancelButton}
          >
            취소
          </button>
        </div>
      </form>
    </Layout>
  );
}
