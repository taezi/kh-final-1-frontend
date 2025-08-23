import './App.css';
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import EditorWritePage from './pages/EditorWritePage';
function App() {
  return (

    <BrowserRouter>
    <div>
      <Routes>
        <Route path="/" element={<MainPage></MainPage>} />
        <Route path="/login" element={<LoginPage></LoginPage>} />
        <Route path="/editor" element={<EditorWritePage/>} />
       

        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
     </div>
    </BrowserRouter>
   
  );
}

export default App;
