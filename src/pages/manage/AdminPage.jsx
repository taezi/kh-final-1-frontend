import AdminInquiry from "../../admin/AdminInquiry";
import Layout from "../../components/Layout";
import "../../css/AdminPage.css";
export default function AdminPage(params) {
  return (
    <Layout>
      <h3>관리자페이지</h3>
      <AdminInquiry></AdminInquiry>
    </Layout>
  );
}
