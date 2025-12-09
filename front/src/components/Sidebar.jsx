import React from "react";
import { Link, useNavigate } from "react-router-dom";
import avatar from "../assets/avatar.svg";
import logo from "../assets/RotinalizeLogo.png";
import Ranking from './Ranking.jsx';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // Force a page reload to clear all component state
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">


    <div className="profile">

      <div>
        <div className="name">{localStorage.getItem('userName') || 'Usuário'}</div>
        <div className="email">{localStorage.getItem('userEmail') || 'email@example.com'}</div>
        <Ranking />
      </div>
    </div>

      <nav className="menu">
        <Link to="/home" className="item">🏃‍♀️ Minhas tarefas</Link>
        <Link to="/todos" className="item">🗒️ Tarefas isoladas</Link>
        <Link to="/performance" className="item">📊 Metas/Desempenho</Link>
        <Link to="/flashcards" className="item">📚 Flashcards</Link>
        <Link to="/settings" className="item">⚙️ Configurações</Link>
        <Link to="/Help" className="item">❓ Ajuda</Link>
        <Link to="/login" className="item">🔐 Login</Link>
      </nav>

      <div className="logout" onClick={handleLogout} style={{ cursor: 'pointer' }}>↩️ Logout</div>
    </aside>
  );
}
