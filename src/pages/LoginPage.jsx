import { useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../store/authSlice";

export default function LoginPage(params) {
  const userid = useRef(null);
  const password = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleLogin = async () => {
    try {
      await dispatch(loginUser({userid : userid, password : password})).unwrap();
      navigate('/');
    } catch (error) {
      console.error("로그인 실패:", error);
        alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
      
    }
    
  }

  return(
    <div>
      <h3>로그인페이지</h3>
      <div>
        <input type="text" ref={userid} placeholder="아이디"/>
        <br></br>
        <input type="password" ref={password} placeholder="비밀번호"/>
        <br />
        <button onClick={handleLogin}>로그인</button>
      </div>
    </div>
  )
  
};
