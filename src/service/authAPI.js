import axios from "axios";


const API_URL = "http://localhost:9999/api/auth/";

export const authAPI = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

