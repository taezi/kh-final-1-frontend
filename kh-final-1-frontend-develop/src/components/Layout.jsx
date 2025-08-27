import "../css/Layout.css";
export default function Layout({ children }) {
  return (
    <>
      <div className="top-blank"></div>
      <div className="container">
        <div className="left-container"></div>
        <div className="main-container">{children}</div>
        <div className="right-container"></div>
      </div>
    </>
  );
}
