import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Todos from "./pages/Todos";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Landing from "./pages/Landing";
import TelaLogin from "./pages/Login";
import TelaCadastro from "./pages/Cadastro";
import CalendarPage from "./pages/CalendarPage";
import PerformancePage from "./pages/PerformancePage";
import FlashcardDeckList from "./pages/FlashcardDeckList";
import FlashcardList from "./pages/FlashcardList";
import FlashcardStudy from "./pages/FlashcardStudy";

export default function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Home key={userId} /> : <Landing />} />
        <Route path="/todos" element={isAuthenticated ? <Todos key={userId} /> : <Navigate to="/" />} />
        <Route path="/settings" element={isAuthenticated ? <Settings key={userId} /> : <Navigate to="/" />} />
        <Route path="/help" element={isAuthenticated ? <Help key={userId} /> : <Navigate to="/" />} />
        <Route path="/home" element={isAuthenticated ? <Home key={userId} /> : <Navigate to="/" />} />
        <Route path="/calendar" element={isAuthenticated ? <CalendarPage key={userId} /> : <Navigate to="/" />} />
        <Route path="/performance" element={isAuthenticated ? <PerformancePage key={userId} /> : <Navigate to="/" />} />
        <Route path="/flashcards" element={<FlashcardDeckList />} />
        <Route path="/flashcards/deck/:deckId" element={<FlashcardList />} />
        <Route path="/flashcards/study" element={<FlashcardStudy />} />
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/cadastro" element={<TelaCadastro />} />
        <Route path="*" element={isAuthenticated ? <Home key={userId} /> : <Landing />} /> {/* rota padrão */}
      </Routes>
    </Router>
  );
}
