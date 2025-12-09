import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/RotinalizeLogo.png";
import { registerUser } from "../api.js";

export default function TelaCadastro() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = e.target.email.value.trim();
    const name = e.target.nome.value.trim();
    const password = e.target.senha.value;
    const confirmPassword = e.target.confirmarSenha.value;

    if (!name) {
      setError("O nome não pode ser vazio.");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("O e-mail não pode ser vazio.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      await registerUser({ name, email, password });
      alert("Usuário cadastrado com sucesso! Faça login para continuar.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Erro ao cadastrar. Verifique os dados e tente novamente.");
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
        <h2 style={{ color: "#1f2937"}}>Crie sua conta</h2>
        <p style={{ color: "#555", marginBottom: 20 }}>
          Cadastre-se para começar a criar e acompanhar seus hábitos
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" placeholder="Digite seu e-mail" required />

          <label htmlFor="nome">Nome</label>
          <input type="text" id="nome" placeholder="Digite seu nome" required />

          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" placeholder="Digite uma senha" required />

          <label htmlFor="confirmarSenha">Confirmar senha</label>
          <input type="password" id="confirmarSenha" placeholder="Confirme sua senha" required />

          <div className="termosUso">
            <input type="checkbox" id="termos" required />
            <label htmlFor="termos">
              Concordo com os <a href="#" className="link">termos de uso</a>
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
          <Link to="/login" className="link-voltar">← Voltar</Link>
        </form>
      </div>
    </div>
  );
}
