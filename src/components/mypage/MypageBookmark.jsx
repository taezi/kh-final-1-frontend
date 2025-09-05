import { useEffect, useState } from "react";
import useAuthStore from "../../store/authStore";
import { getBookmarks } from "../../service/bookmarkAPI";

export default function MypageBookmark(params) {
  const user = useAuthStore((state) => state.user);
  const [bookmarks, setBookmarks] = useState([]);
  const [filter, setFilter] = useState("all");

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

  const getFilteredBookmarks = () => {
    if (filter === "all") {
      return bookmarks;
    } else {
      return bookmarks.filter((bookmark) => bookmark.contenttype === filter);
    }
  };

  const filteredList = getFilteredBookmarks();

  return (
    <div>
      {}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>내 북마크</h2>
        {}
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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #f9f9f9", padding: "8px" }}>
                종류
              </th>
              <th style={{ border: "1px solid #f9f9f9", padding: "8px" }}>
                제목
              </th>
              <th style={{ border: "1px solid #f9f9f9", padding: "8px" }}>
                저장일
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((bookmark) => (
              <tr key={bookmark.contentno}>
                <td style={{ border: "1px solid #f9f9f9", padding: "8px" }}>
                  {getDisplayTypeName(bookmark.contenttype)}
                </td>
                <td style={{ border: "1px solid #f9f9f9", padding: "8px" }}>
                  {bookmark.title}
                </td>
                <td style={{ border: "1px solid #f9f9f9", padding: "8px" }}>
                  {bookmark.addedat}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
