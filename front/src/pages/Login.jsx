import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/RotinalizeLogo.png";
import { loginUser, getUsers } from "../api.js";

export default function TelaLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const name = e.target.nome.value.trim();
    const password = e.target.senha.value;

    if (!name) {
      setError("O nome não pode ser vazio.");
      setLoading(false);
      return;
    }

    try {
      await loginUser({ name, password });
      // Set flag to show tutorial on login
      localStorage.setItem('justLoggedIn', 'true');
      // Force a page reload to clear any cached component state
      window.location.href = "/home";
    } catch (err) {
      setError(err.message || "Nome ou senha incorretos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" style={{ textDecoration: "none" }}>
          <img src={logo} alt="Rotinalize Logo" style={{ width: 140, cursor: "pointer" }} />
        </Link>

      <div className="auth-card">
        <h2 style={{ color: "#1f2937"}}>Bem-vindo de volta</h2>
        <p style={{ color: "#555", marginBottom: 20 }}>
          Entre na sua conta para continuar organizando sua rotina
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

          <label htmlFor="nome">Nome</label>
          <input type="text" id="nome" placeholder="Digite seu nome" required />

          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" placeholder="Digite sua senha" required />

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="auth-links">
            <Link to="#" className="link">Esqueceu sua senha?</Link>
            <Link to="/cadastro" className="link">Criar conta</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
