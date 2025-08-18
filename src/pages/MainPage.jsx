import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

export default function MainPage(params) {

  const dispatch = useDispatch();

  return (
    <div>
      메인페이지
      <div>
        <Link to="/login">로그인</Link>
        <button onClick={() => dispatch(logout())}>로그아웃</button>
      </div>
    </div>
  )
};
