import { useEffect, useState } from "react";
import useAuthStore from "../../store/authStore";
import { getBookmarks } from "../../service/bookmarkAPI";
import { useNavigate } from "react-router-dom";
import "../../css/MypageBookmark.css";

export default function MypageBookmark() {
  const user = useAuthStore((state) => state.user);
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getBookmarks(user.userno)
      .then((data) => setBookmarks(data))
      .catch((err) => console.error(err));
  }, [user]);

  const getDisplayTypeName = (type) => {
    switch (type) {
      case "editor":
        return "에디터 추천 코스";
      case "event":
        return "문화/행사";
      case "cafe":
        return "카페";
      case "restaurant":
        return "맛집";
      default:
        return type;
    }
  };

  const getFilteredBookmarks = () =>
    filter === "all"
      ? bookmarks
      : bookmarks.filter((bookmark) => bookmark.contenttype === filter);

  const filteredList = getFilteredBookmarks();

  const goToDetail = (bookmark) => {
    console.log("이동하는 북마크 정보 : ", bookmark);
    if (bookmark.type === "editor") {
      navigate(`/editor/${bookmark.contentno}`);
    }
    if (bookmark.type === "event") {
      navigate(`/culture/${bookmark.contentno}`);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>내 북마크</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: "150px" }}
        >
          <option value="all">전체</option>
          <option value="event">문화/행사</option>
          <option value="cafe">카페</option>
          <option value="restaurant">맛집</option>
          <option value="editor">에디터 추천 코스</option>
        </select>
      </div>

      {filteredList.length === 0 ? (
        <p>저장된 내용이 없습니다. 새로운 내용을 추가해 보세요!</p>
      ) : (
        <table className="bookmark-table">
          <thead>
            <tr>
              <th>종류</th>
              <th>제목</th>
              <th>북마크 누른 시간</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((bookmark) => (
              <tr key={bookmark.contentno} onClick={() => goToDetail(bookmark)}>
                <td>{getDisplayTypeName(bookmark.contenttype)}</td>
                <td>{bookmark.title}</td>
                <td>{bookmark.addedat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
