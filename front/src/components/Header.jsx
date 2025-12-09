import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/RotinalizeLogo.png";
import NotificationsModal from './NotificationsModal.jsx';
import { getHabits, getLists } from '../api.js';

export default function Header({ searchValue, onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date()
  const date = today.toLocaleDateString('pt-BR', {weekday:'long', day:'2-digit', month:'2-digit', year:'numeric'})
  const time = today.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const handleCalendarClick = () => {
    navigate('/calendar');
  };

  const handleNotificationsClick = () => {
    setShowNotificationsModal(true);
  };

  const handleNavigateToHabit = (habitId, listId) => {
    // Set localStorage to highlight the habit
    localStorage.setItem('highlightHabitId', habitId);
    // Set localStorage to open the list if it's a list habit
    if (listId) {
      localStorage.setItem('openListId', listId);
    }
    // If already on Home page, trigger navigation directly
    if (location.pathname === '/' || location.pathname === '/home') {
      // Trigger a state update in Home component to handle navigation
      window.dispatchEvent(new CustomEvent('notificationNavigation', { detail: { habitId, listId } }));
    } else {
      // Navigate to Home where lists are displayed
      navigate('/');
    }
  };

  useEffect(() => {
    async function loadNotifications() {
      try {
        const habits = await getHabits();
        const lists = await getLists();
        const listMap = new Map(lists.map(l => [l.id, l.name]));
        const todayNotifications = [];
        const daysOfWeek = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
        const dayAbbreviations = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
        const todayDay = daysOfWeek[today.getDay()];
        const todayAbbrev = dayAbbreviations[today.getDay()];

        // Filtrar todos hábitos ativos com dueDate hoje ou recorrentes hoje
        habits.filter(h => {
          const isDueToday = h.dueDate === todayStr;
          const isRecurringToday = h.dias && (Array.isArray(h.dias) ? h.dias : h.dias.split(',').map(s => s.trim())).includes(todayAbbrev);
          return h.active && (isDueToday || isRecurringToday);
        }).forEach(h => {
          todayNotifications.push({
            title: h.title,
            desc: h.description,
            listName: h.listId ? listMap.get(h.listId) : null,
            habitId: h.id,
            listId: h.listId
          });
        });

        setNotifications(todayNotifications);
        setNotificationCount(todayNotifications.length);
      } catch (err) {
        console.error('Erro ao carregar notificações:', err);
      }
    }

    loadNotifications();

    // Atualizar notificações a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [todayStr, today]);

  return (
    <>
      <header className="header">
        <div className="brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <img src={logo} alt="Rotinalize Logo" style={{ width: 140, cursor: "pointer" }} />
          </Link>
        </div>

        <div className="search">
          <span id='lupaBuscar'>🔎</span>
          <input
            placeholder="Pesquisar uma tarefa..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="header-icons">
          <button className="icon-btn" title="Notificações" onClick={handleNotificationsClick} style={{ position: 'relative' }}>
            🔔
            {notificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {notificationCount}
              </span>
            )}
          </button>
          <button className="icon-btn" title="Calendário" onClick={handleCalendarClick}>📅</button>
        </div>
        <div className="datetime">{date} - {time}</div>
      </header>

      <NotificationsModal
        open={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        onNavigateToHabit={handleNavigateToHabit}
      />
    </>
  )
}
