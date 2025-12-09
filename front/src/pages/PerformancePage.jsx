import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { getHabits, getLists } from '../api.js';

const LOCAL_STORAGE_KEY = 'userGoals';
const ACTIVE_GOAL_CREATION_DATE_KEY = 'activeGoalCreationDate';

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
  return new Date(d.setDate(diff));
}

function getStartOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

// Verifica se a data está dentro do período da semana do objetivo
function isInWeek(goalDate, checkDate) {
  const startOfWeek = getStartOfWeek(goalDate);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  return checkDate >= startOfWeek && checkDate < endOfWeek;
}

// Verifica se a data está dentro do mês do objetivo
function isInMonth(goalDate, checkDate) {
  const startOfMonth = getStartOfMonth(goalDate);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  return checkDate >= startOfMonth && checkDate < endOfMonth;
}

export default function PerformancePage() {
  const [habits, setHabits] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for goals created by user
  const [goals, setGoals] = useState(() => {
    const storedGoals = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedGoals ? JSON.parse(storedGoals) : [];
  });

  // New goal inputs
  const [newGoalCount, setNewGoalCount] = useState('');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState('week'); // default to week

  useEffect(() => {
    async function loadData() {
      try {
        const [habitsData, listsData] = await Promise.all([getHabits(), getLists()]);
        setHabits(habitsData || []);
        setLists(listsData || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save goals to localStorage on update
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
    // Also update the active goal creationDate in localStorage
    if(goals.length > 0) {
      // e.g., store the latest goal creationDate as active
      const latestGoal = goals[goals.length - 1];
      localStorage.setItem(ACTIVE_GOAL_CREATION_DATE_KEY, latestGoal.creationDate);
    } else {
      localStorage.removeItem(ACTIVE_GOAL_CREATION_DATE_KEY);
    }
  }, [goals]);

  // Calcular métricas
  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.active === false).length;
  const pendingHabits = habits.filter(h => h.active === true).length;
  const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Métricas das listas
  const totalLists = lists.length;
  const completedLists = lists.filter(l => l.habits?.every(h => h.active === false)).length;
  const listsCompletionRate = totalLists > 0 ? Math.round((completedLists / totalLists) * 100) : 0;

  // Hábitos por tipo
  const punctualHabits = habits.filter(h => h.dueDate && !h.dias?.length);
  const recurringHabits = habits.filter(h => h.dias?.length > 0);

  const punctualCompleted = punctualHabits.filter(h => h.active === false).length;
  const recurringCompleted = recurringHabits.filter(h => h.active === false).length;

  // Helper: Calculate progress for a user-defined goal
  function calculateGoalProgress(goal) {
    // Calculate how many habits completed within the goal's relative timeframe
    const now = new Date();
    // Using goal.creationDate to define timeframe start
    const goalStartDate = new Date(goal.creationDate);

    let isInTimeframe;

    if (goal.timeframe === 'week') {
      isInTimeframe = (date) => isInWeek(goalStartDate, date);
    } else if (goal.timeframe === 'month') {
      isInTimeframe = (date) => isInMonth(goalStartDate, date);
    } else {
      // Unknown timeframe, count all completed
      isInTimeframe = () => true;
    }

    // Count number of completed habits inside timeframe (using habit.dueDate)
    const completedInTimeframe = habits.filter(h => {
      // Only completed habits (active === false)
      if (h.active !== false) return false;

      // If habit has a dueDate, check if inside timeframe
      if (h.dueDate) {
        const habitDate = new Date(h.dueDate);
        return isInTimeframe(habitDate);
      }
      // If no dueDate, include anyway (optional alternative: exclude)
      return isInTimeframe(now); // fallback to true for habits without dueDate within timeframe
    }).length;

    return completedInTimeframe > goal.target ? goal.target : completedInTimeframe;
  }

  // Add new goal handler
  function handleAddGoal() {
    if (!newGoalCount || isNaN(newGoalCount) || newGoalCount < 1) {
      alert('Por favor, insira uma quantidade válida de tarefas.');
      return;
    }
    const newGoal = {
      id: Date.now(),
      target: parseInt(newGoalCount, 10),
      timeframe: newGoalTimeframe,
      creationDate: new Date().toISOString()
    };
    setGoals([...goals, newGoal]);
    setNewGoalCount('');
    setNewGoalTimeframe('week');
  }

  // Delete goal handler
  function handleDeleteGoal(id) {
    setGoals(goals.filter(g => g.id !== id));
  }

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <Header />
        <main className="main">
          <div>Carregando métricas...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <Header />

      <main className="main">
        <div className="performance-page">
          <h1>📊 Metas e Desempenho</h1>

          {/* New Goal Creation Section */}
          <div className="new-goal-section" style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>Criar Nova Meta</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="number"
                min="1"
                placeholder="Quantidade de tarefas"
                value={newGoalCount}
                onChange={(e) => setNewGoalCount(e.target.value)}
                style={{ width: '180px', padding: '0.5rem' }}
              />
              <select
                value={newGoalTimeframe}
                onChange={(e) => setNewGoalTimeframe(e.target.value)}
                style={{ padding: '0.5rem' }}
              >
                <option value="week">Semana</option>
                <option value="month">Mês</option>
              </select>
              <button onClick={handleAddGoal} style={{ padding: '0.5rem 1rem' }}>
                Adicionar
              </button>
            </div>
          </div>

          {/* User Goals Display Section */}
          <div className="user-goals-section" style={{ marginBottom: '2rem' }}>
            <h3>Suas Metas</h3>
            {goals.length === 0 && <p>Não há metas criadas.</p>}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {goals.map(goal => {
                const progress = calculateGoalProgress(goal);
                const progressPercent = Math.round((progress / goal.target) * 100);

                return (
                  <div key={goal.id} className="goal-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', width: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Meta: {goal.target} tarefas</strong>
                      <button onClick={() => handleDeleteGoal(goal.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }} title="Excluir Meta">×</button>
                    </div>
                    <p>Período: {goal.timeframe === 'week' ? 'Semana' : 'Mês'}</p>
                    <div className="progress-bar" style={{ backgroundColor: '#e0e0e0', borderRadius: '4px', height: '16px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progressPercent}%`,
                        height: '100%',
                        backgroundColor: '#4CAF50',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <p>{progress} / {goal.target} concluídas ({progressPercent}%)</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="metrics-grid">
            {/* Card de Conclusão Geral */}
            <div className="metric-card">
              <h3>Taxa de Conclusão Geral</h3>
              <div className="progress-circle">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e0e0e0"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#4CAF50"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionRate / 100)}`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="progress-text">{completionRate}%</div>
              </div>
              <p>{completedHabits} de {totalHabits} hábitos concluídos</p>
            </div>

            {/* Card de Listas */}
            <div className="metric-card">
              <h3>Listas Concluídas</h3>
              <div className="progress-circle">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e0e0e0"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#2196F3"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - listsCompletionRate / 100)}`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="progress-text">{listsCompletionRate}%</div>
              </div>
              <p>{completedLists} de {totalLists} listas concluídas</p>
            </div>

            {/* Card de Hábitos Pontuais */}
            <div className="metric-card">
              <h3>Hábitos Pontuais</h3>
              <div className="bar-chart">
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${punctualHabits.length > 0 ? (punctualCompleted / punctualHabits.length) * 100 : 0}%`,
                      backgroundColor: '#FF9800'
                    }}
                  ></div>
                </div>
                <p>{punctualCompleted}/{punctualHabits.length} concluídos</p>
              </div>
            </div>

            {/* Card de Hábitos Recorrentes */}
            <div className="metric-card">
              <h3>Hábitos Recorrentes</h3>
              <div className="bar-chart">
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${recurringHabits.length > 0 ? (recurringCompleted / recurringHabits.length) * 100 : 0}%`,
                      backgroundColor: '#9C27B0'
                    }}
                  ></div>
                </div>
                <p>{recurringCompleted}/{recurringHabits.length} concluídos</p>
              </div>
            </div>
          </div>

          <div className="charts-section">
            {/* Gráfico de Barras Detalhado */}
            <div className="chart-section">
              <h3>Distribuição de Hábitos</h3>
              <p className="chart-description">
                Mostra a distribuição entre hábitos concluídos e pendentes.
              </p>
              <div className="chart-container">
                <div className="chart-bar">
                  <div className="bar-label">Pendentes</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill pending"
                      style={{ width: `${totalHabits > 0 ? (pendingHabits / totalHabits) * 100 : 0}%` }}
                    >
                      {pendingHabits}
                    </div>
                  </div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Concluídos</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill completed"
                      style={{ width: `${totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0}%` }}
                    >
                      {completedHabits}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Conclusão por Tipo */}
            <div className="chart-section">
              <h3>Conclusão por Tipo</h3>
              <p className="chart-description">
                Compara o desempenho entre hábitos pontuais (com data específica) e recorrentes (diários/semanais).
              </p>
              <div className="chart-container">
                <div className="chart-bar">
                  <div className="bar-label">Pontuais</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill punctual"
                      style={{ width: `${punctualHabits.length > 0 ? (punctualCompleted / punctualHabits.length) * 100 : 0}%` }}
                    >
                      {punctualCompleted}/{punctualHabits.length}
                    </div>
                  </div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Recorrentes</div>
                  <div className="bar-wrapper">
                    <div
                      className="bar-fill recurring"
                      style={{ width: `${recurringHabits.length > 0 ? (recurringCompleted / recurringHabits.length) * 100 : 0}%` }}
                    >
                      {recurringCompleted}/{recurringHabits.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Lista de Hábitos Pendentes */}
          <div className="pending-habits">
            <h3>🔔 Hábitos Pendentes</h3>
            {pendingHabits === 0 ? (
              <p>🎉 Parabéns! Você concluiu todos os seus hábitos!</p>
            ) : (
              <ul>
                {habits.filter(h => h.active === true).map(habit => (
                  <li key={habit.id}>
                    <strong>{habit.title}</strong>
                    {habit.dueDate && <span> - Vence em: {new Date(habit.dueDate).toLocaleDateString('pt-BR')}</span>}
                    {habit.dias?.length > 0 && <span> - Dias: {habit.dias.join(', ')}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
