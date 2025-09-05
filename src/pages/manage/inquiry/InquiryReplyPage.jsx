import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { useRef, useEffect } from "react";
import { createInquiryReply } from "../../../service/manageAPI";
import "../../../css/InquiryReplyPage.css";

export default function InquiryReplyPage(params) {
  const { inquiryno } = useParams();
  const replyContent = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("문의글 번호(답변) : ", inquiryno);
  }, [inquiryno]);

  const handleClickCancelButton = () => {
    console.log("취소되었습니다");
    navigate(-1);
  };

  const handleClickCreateButton = async () => {
    if (replyContent.current.value.trim() === "") {
      console.log("내용을 입력해주세요.");
      return;
    }

    console.log("문의글 번호(답변) : ", inquiryno);
    console.log("문의글 내용(답변) :", replyContent.current.value);

    const replyData = {
      inquiryno: inquiryno,
      replyContent: replyContent.current.value,
    };

    try {
      const response = await createInquiryReply(replyData);
      console.log("등록되었습니다", response);
      navigate(-1);
    } catch (error) {
      console.error("답변 등록 중 오류 발생:", error);
      console.log("답변 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Layout>
      <div className="reply-container">
        <h3>1:1 문의 관리자 답변 페이지</h3>
        <form
          className="inquiry-form"
          onSubmit={(e) => {
            e.preventDefault();
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
          <div className="button-group-1">
            <button type="submit-1" className="submit-button-1">
              등록
            </button>
            <button
              type="button-1"
              className="cancel-button-1"
              onClick={handleClickCancelButton}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
