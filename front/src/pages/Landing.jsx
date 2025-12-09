import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import StudyPlan from '../components/Chat.jsx';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <Sidebar />
      <Header searchQuery="" onSearch={() => {}} />

      <main className="main">
        <div className="columns">
          {/* Painel de Boas-vindas */}
          <section className="panel full-height">
            <h3>Bem-vindo ao Rotinalize!</h3>
            <div className="scrollable-content">
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h4>Organize seus hábitos e listas de forma simples e eficiente.</h4>
                <p>Para começar, faça login ou cadastre-se, se for sua primeira vez aqui!.</p>
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      padding: '10px 20px',
                      margin: '10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => navigate('/cadastro')}
                    style={{
                      padding: '10px 20px',
                      margin: '10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Cadastrar-se
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Painel vazio para manter layout */}
          <section className="panel full-height">
            <h3>Dicas</h3>
            <div className="scrollable-content">
              <div style={{ padding: '20px' }}>
                <p>• Crie hábitos diários para melhorar sua produtividade.</p>
                <p>• Organize tarefas em listas personalizadas.</p>
                <p>• Use o chat IA para planejar seus estudos.</p>
                <p>• Visualize seus hábitos no calendário para acompanhar o progresso.</p>
              </div>
            </div>
          </section>

          {/* Painel da IA */}
          <StudyPlan isAuthenticated={false} />
        </div>
      </main>
    </div>
  );
}
