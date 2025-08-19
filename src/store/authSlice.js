import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authAPI } from "../service/authAPI";

// 로그인
export const loginUser = createAsyncThunk(
  "login",
  async ({ userid, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post("login", { userid, password });
      alert("로그인 성공");
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || " 로그인 실패");
    }
  }
);

// 회원가입
export const registerUser = createAsyncThunk(
  "registerUser",
  async ({ userid, username, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.post("register", {
        userid,
        username,
        password,
      });
      return response.data; // 성공 메시지 or 등록된 user 정보
    } catch (err) {
      return rejectWithValue(err.response?.data || "회원가입 실패");
    }
  }
);

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // 로그인
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // 회원 가입
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
