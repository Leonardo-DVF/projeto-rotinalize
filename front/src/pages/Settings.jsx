import React, { useState, useContext } from "react"
import avatar from "../assets/avatar.svg"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { ThemeContext } from "../context/ThemeContext"

export default function Settings({ notifySingle, setNotifySingle }) {
  const [name, setName] = useState("Maria Silva")
  const { darkMode, setDarkMode } = useContext(ThemeContext)

  return (
    <div className="app">
      <Sidebar />
      <Header />

      <main className="main">
        <h2 className="settings-title">⚙️ Configurações</h2>

        <div className="settings-panel">
          <div className="settings-content">
            {/* Foto de perfil */}
            <div className="settings-profile">
              <img src={avatar} alt="avatar" className="profile-pic" />
              <button className={`profile-btn ${darkMode ? "dark" : ""}`} disabled>
                Trocar foto de perfil
              </button>
            </div>

            {/* Nome */}
            <div className="settings-field">
              <label>Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Botões de alternância */}
            <div className="settings-toggles">
              <div className="toggle-item">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifySingle}
                    onChange={() => setNotifySingle((v) => !v)}
                  />
                  <span className="slider"></span>
                </label>
                <span>Notificar apenas tarefas únicas</span>
              </div>

              <div className="toggle-item">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode((v) => !v)}
                  />
                  <span className="slider"></span>
                </label>
                <span>Modo escuro</span>
              </div>
            </div>

            {/* Links */}
            <div className="settings-links">
              <a href="#">Termos de uso</a>
              <a href="#">Trocar senha</a>
            </div>
          </div>

          {/* Excluir conta */}
          <div className="settings-delete">
            <a href="#">Excluir conta</a>
          </div>
        </div>
      </main>
    </div>
  )
}
