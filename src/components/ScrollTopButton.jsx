import { useEffect, useState } from "react";
import "../css/ScrollTopButton.css";
export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 스크롤 맨 위로 올리기
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {visible && (
        <button className="scroll-to-top" onClick={handleScrollTop}>
          ↑
        </button>
      )}
    </>
  );
}
