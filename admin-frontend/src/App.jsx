import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserChat from './pages/UserChat';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        //routes for login, admin dashboard and user chat
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<UserChat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;