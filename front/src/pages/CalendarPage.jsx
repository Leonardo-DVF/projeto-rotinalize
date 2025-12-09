import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Calendar from '../components/Calendar.jsx';
import ContextualTooltip from '../components/ContextualTooltip.jsx';
import { getHabits, getLists } from '../api.js';

export default function CalendarPage() {
  const [activities, setActivities] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    async function loadData() {
      try {
        const habitsData = await getHabits();
        const listsData = await getLists();

        const mappedActivities = (habitsData || [])
          .filter((h) => !h.listId)
          .map((h) => ({
            id: h.id,
            title: h.title,
            desc: h.description || '',
            time: h.dueDate || '',
            repeat: (h.dias && h.dias.length > 0)
              ? h.dias.join(', ')
              : (h.dueDate ? 'Pontual' : 'Não'),
            dias: h.dias ? (Array.isArray(h.dias) ? h.dias : h.dias.split(',').map(s => s.trim())) : [],
            active: h.active !== undefined ? h.active : true,
            createdAt: h.createdAt || new Date().toISOString(),
          }));

        const mappedLists = (listsData || []).map(list => ({
          ...list,
          habits: (list.habits || []).map(h => ({
            ...h,
            dias: h.dias ? (Array.isArray(h.dias) ? h.dias : h.dias.split(',').map(s => s.trim())) : [],
          })),
        }));

        setActivities(mappedActivities);
        setLists(mappedLists);
      } catch (err) {
        console.error('Erro ao carregar dados para o calendário:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <Header searchValue={searchQuery} onSearch={setSearchQuery} />
        <main className="main">
          <div style={{ textAlign: 'center', padding: '20px' }}>Carregando calendário...</div>
        </main>
      </div>
    );
  }

  const handleCloseCalendar = () => {
    navigate('/home');
  };

  const calendarHelpContent = (
    <div>
      <h4>Como usar o Calendário</h4>
      <p>O calendário mostra seus hábitos e tarefas organizados por data.</p>
      <ul>
        <li><strong>Cores dos dias:</strong></li>
        <ul>
          <li>Verde claro: Dia de hoje</li>
          <li>Verde médio: Dias com apenas hábitos recorrentes</li>
          <li>Amarelo: Dias com apenas hábitos pontuais</li>
          <li>Gradiente verde-amarelo: Dias com hábitos mistos</li>
        </ul>
        <li><strong>Interação:</strong></li>
        <ul>
          <li>Clique em um dia para ver detalhes das tarefas</li>
          <li>Use os botões de navegação para mudar de mês</li>
        </ul>
        <li><strong>Regras dos hábitos recorrentes:</strong></li>
        <ul>
          <li>Aparecem apenas a partir da data de criação</li>
          <li>Seguem os dias da semana selecionados</li>
        </ul>
      </ul>
    </div>
  );

  return (
    <div className="app">
      <Sidebar />
      <Header searchValue={searchQuery} onSearch={setSearchQuery} />
      <main className="main">
        <div className="panel" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3>Calendário de Tarefas</h3>
              <ContextualTooltip content={calendarHelpContent} position="right">
                <button
                  style={{
                    background: 'var(--muted)',
                    color: 'var(--text)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Ajuda sobre o Calendário"
                >
                  ?
                </button>
              </ContextualTooltip>
            </div>
            <button
              onClick={handleCloseCalendar}
              style={{
                background: 'var(--brand)',
                color: '#0b2c22',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                boxShadow: 'var(--shadow)',
              }}
              title="Voltar para Home"
            >
              ×
            </button>
          </div>
          <Calendar activities={activities} lists={lists} />
        </div>
      </main>
    </div>
  );
}
