import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { authAPI } from "../service/authAPI";

// Redux-Toolkit의 thunk와 extraReducers의 로직을 Zustand 스토어 내부에 통합합니다.
const useAuthStore = create(
  // 개발자 도구 및 지속성(persist) 미들웨어 적용
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        loading: false,
        error: null,

        justLoggedOut: false,
        clearJustLoggedOut: () => set({ justLoggedOut: false }),

        // 사용자 정보 업데이트 (동기 처리)
        updateUser: (newUserData) =>
          set((state) => {
            const updatedUser = { ...state.user, ...newUserData };

            // localStorage(auth-storage)도 갱신
            const authData = JSON.parse(localStorage.getItem("auth-storage"));
            if (authData && authData.state && authData.state.user) {
              authData.state.user = updatedUser;
              localStorage.setItem("auth-storage", JSON.stringify(authData));
            }

            return { user: updatedUser };
          }),

        // 로그인 (비동기 처리)
        loginUser: async ({ userid, password }) => {
          set({ loading: true, error: null });
          try {
            const response = await authAPI.post("login", { userid, password });
            const { user, accessToken, refreshToken } = response.data;
            console.log(user);
            alert("로그인 성공");
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            set({
              loading: false,
              user,
              accessToken,
              refreshToken,
            });
            return response.data;
          } catch (error) {
            const errorMessage = error.response?.data || "로그인 실패";
            set({ loading: false, error: errorMessage });
            throw new Error(errorMessage);
          }
        },

        // 회원가입 (비동기 처리)
        registerUser: async ({ userid, username, password }) => {
          set({ loading: true, error: null });
          try {
            await authAPI.post("register", { userid, username, password });
            set({ loading: false });
          } catch (error) {
            const errorMessage = error.response?.data || "회원가입 실패";
            set({ loading: false, error: errorMessage });
            throw new Error(errorMessage);
          }
        },

        // 로그아웃 (동기 처리)
        logout: () => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("auth-storage");
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            error: null,
            justLoggedOut: true,
          });
        },
      }),
      {
        name: "auth-storage", // 로컬 스토리지에 저장될 이름
      }
    )
  )
);

export default useAuthStore;
