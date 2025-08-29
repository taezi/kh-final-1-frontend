import Layout from "../components/Layout";
import MypageUpdate from "../components/Mypageupdate";
import MypageDelete from "../components/MypageDelete"; 
import "../css/MypagePage.css";

export default function MypagePage() {
  return (
    <Layout>
      <div className="mypage-content-wrapper">
        <MypageUpdate />
        <MypageDelete />
      </div>
    </Layout>
  );
}
