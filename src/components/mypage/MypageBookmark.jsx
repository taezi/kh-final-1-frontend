import { useEffect, useState } from "react";
import useAuthStore from "../../store/authStore";
import { getBookmarks } from "../../service/bookmarkAPI";

export default function MypageBookmark(params) {
  const user = useAuthStore((state) => state.user);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (!user) return;
    getBookmarks(user.userno)
      .then((data) => setBookmarks(data))
      .catch((err) => console.error(err));
  }, [user]);
  console.log("북마크리스트 : " + bookmarks);

  return (
    <div>
      <h2>내 북마크</h2>
      <ul>
        {bookmarks.map((bookmark) => (
          <li key={bookmark.contentno}>
            {bookmark.contenttype} - {bookmark.title} - {bookmark.addedat}
          </li>
        ))}
      </ul>
    </div>
  );
}
