import axios from "axios";
import setupInterceptors from "./interceptor";

const API_URL = "http://localhost:9999/api/bookmarks";

export const bookmarkAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

setupInterceptors(bookmarkAPI);

export const getBookmarks = async (userno, type) => {
  try {
    console.log("userno, type : ", userno, type);
    const response = await bookmarkAPI.get(`/${userno}`, {
      params: { type },
    });
    console.log("나의 북마크 :", response.data);
    return response.data;
  } catch (error) {
    console.error("getBookmarks error:", error);
    throw error;
  }
};

export const addBookmark = (bookmark) => bookmarkAPI.post("", bookmark);

export const removeBookmark = (bookmark) =>
  bookmarkAPI.delete("", { data: bookmark });
