import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ActivityCard from '../components/ActivityCard.jsx';
import StudyPlan from '../components/Chat.jsx';
import AddHabitModal from '../components/AddHabitModal.jsx';
import ActivityOptionsModal from '../components/ActivityOptionsModal.jsx';
import HabitList from '../components/HabitList.jsx';
import AddListModal from '../components/AddListModal.jsx';
import AddHabitInListModal from '../components/AddHabitInListModal.jsx';
import HabitOptionsModal from '../components/HabitOptionsModal.jsx';
import EditHabitInListModal from '../components/EditHabitInListModal.jsx';
import ListOptionsModal from '../components/ListOptionsModal.jsx';
import ContextualTooltip from '../components/ContextualTooltip.jsx';
import adImage from '../assets/Patrocinio.png';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getLists,
  createList,
  deleteList,
  getList,
  createHabitInList,
} from '../api.js';

export default function Home() {
  const [openHabitModal, setOpenHabitModal] = useState(false);
  const [openListModal, setOpenListModal] = useState(false);
  const [openAddHabitInListModal, setOpenAddHabitInListModal] = useState(false);
  const [openOptions, setOpenOptions] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedListForHabit, setSelectedListForHabit] = useState(null);
  const [openHabitOptionsModal, setOpenHabitOptionsModal] = useState(false);
  const [selectedHabitInList, setSelectedHabitInList] = useState(null);
  const [openEditHabitInListModal, setOpenEditHabitInListModal] = useState(false);
  const [openListOptionsModal, setOpenListOptionsModal] = useState(false);
  const [selectedListForOptions, setSelectedListForOptions] = useState(null);
  const [activities, setActivities] = useState([]);
  const [lists, setLists] = useState([]);
  const [completedLists, setCompletedLists] = useState(new Set(JSON.parse(localStorage.getItem('completedLists') || '[]')));
  const [loading, setLoading] = useState(true);
  const [loadingLists, setLoadingLists] = useState(true);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('created');
  const [listSortOption, setListSortOption] = useState('created');
  const [expandedLists, setExpandedLists] = useState(() => {
    const saved = localStorage.getItem('expandedLists');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const isAuthenticated = !!localStorage.getItem('token');
  const userId = localStorage.getItem('userId') || 'c659c1c4-cd84-4bba-a950-8f3918917e83';

  // Contextual tooltip state
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [tooltipOnConfirm, setTooltipOnConfirm] = useState(null);
  const [tooltipKey, setTooltipKey] = useState('');

  // General tutorial overlay state
  const [showGeneralTutorial, setShowGeneralTutorial] = useState(false);
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [showAdAfterTutorial, setShowAdAfterTutorial] = useState(false);
  const [showGeneralTutorialAfterAd, setShowGeneralTutorialAfterAd] = useState(false);
  const [notificationNavigationTrigger, setNotificationNavigationTrigger] = useState(0);

  function closeTooltip() {
    setShowTooltip(false);
    if (tooltipKey) {
      localStorage.setItem(`tutorial${tooltipKey}Shown`, 'true');
    }
    setTooltipMessage('');
    setTooltipOnConfirm(null);
    setTooltipKey('');
  }

  function showContextualTooltip(message, onConfirm, key) {
    setTooltipMessage(message);
    setTooltipOnConfirm(() => onConfirm);
    setTooltipKey(key);
    setShowTooltip(true);
  }

  // =======================
  // 🔹 Carregar hábitos
  // =======================
  useEffect(() => {
    async function loadHabits() {
      try {
        const data = await getHabits();
        const mapped = (data || [])
          .filter((h) => !h.listId) // Filtrar apenas hábitos isolados (sem listId)
          .map((h) => ({
            id: h.id,
            title: h.title,
            desc: h.description || '',
            time: h.dueDate || '',
            repeat:
              h.dias && h.dias.length > 0
                ? h.dias.join(', ')
                : h.dueDate
                ? 'Pontual'
                : 'Não',
            dias: h.dias ? (Array.isArray(h.dias) ? h.dias : h.dias.split(',').map(s => s.trim())) : [],
            active: h.active !== undefined ? h.active : true,
            createdAt: h.createdAt || new Date().toISOString(),
          }));
        setActivities(mapped);
      } catch (err) {
        console.error('Erro ao carregar hábitos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHabits();
  }, []);

  // =======================
  // 📋 Carregar listas
  // =======================
  useEffect(() => {
    async function loadLists() {
      try {
        const data = await getLists();
        // Filtrar listas concluídas (armazenadas localmente)
        const filteredData = (data || [])
          .filter(list => !completedLists.has(list.id))
          .map(list => ({
            ...list,
            habits: (list.habits || []).map(h => ({
              ...h,
              dias: h.dias ? (Array.isArray(h.dias) ? h.dias : h.dias.split(',').map(s => s.trim())) : [],
            })),
          }));
        setLists(filteredData);
      } catch (err) {
        console.error('Erro ao carregar listas:', err);
      } finally {
        setLoadingLists(false);
      }
    }
    loadLists();
  }, [completedLists]);

  // =======================
  // 📚 General Tutorial and Ad Popup
  // =======================
  useEffect(() => {
    const tutorialDisabled = localStorage.getItem('tutorialDisabled');
    const generalTutorialShown = localStorage.getItem('generalTutorialShown');
    const justLoggedIn = localStorage.getItem('justLoggedIn');
    if (justLoggedIn) {
      localStorage.removeItem('generalTutorialShown'); // Reset to show tutorial on login
      setShowGeneralTutorial(true);
      setShowAdAfterTutorial(true);
      localStorage.removeItem('justLoggedIn'); // Remove flag after showing
    } else if (!tutorialDisabled && (!generalTutorialShown)) {
      setShowGeneralTutorial(true);
    }

    // Handle notification navigation
    const openListId = localStorage.getItem('openListId');
    const highlightHabitId = localStorage.getItem('highlightHabitId');
    if (openListId) {
      localStorage.removeItem('openListId');
      // Expand the list
      setExpandedLists(prev => new Set([...prev, openListId]));
      // Scroll to the habit list panel
      setTimeout(() => {
        const panel = document.getElementById('habit-list-panel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth' });
        // Highlight the habit after scrolling
        if (highlightHabitId) {
          setTimeout(() => {
            const habitElement = document.querySelector(`[data-habit-id="${highlightHabitId}"]`);
            if (habitElement) {
              habitElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 200);
        }
      }, 100);
    } else if (highlightHabitId) {
      // Handle highlighting for standalone habits (not in lists)
      setTimeout(() => {
        const habitElement = document.querySelector(`[data-habit-id="${highlightHabitId}"]`);
        if (habitElement) {
          habitElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

  // Handle notification navigation when already on Home page
  useEffect(() => {
    const handleNotificationNavigation = (event) => {
      const { habitId, listId } = event.detail;
      if (listId) {
        // Expand the list
        setExpandedLists(prev => new Set([...prev, listId]));
        // Scroll to the habit list panel
        setTimeout(() => {
          const panel = document.getElementById('habit-list-panel');
          if (panel) panel.scrollIntoView({ behavior: 'smooth' });
          // Highlight the habit after scrolling
          setTimeout(() => {
            const habitElement = document.querySelector(`[data-habit-id="${habitId}"]`);
            if (habitElement) {
              habitElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            window.dispatchEvent(new CustomEvent('highlightHabit', { detail: { habitId } }));
          }, 200);
        }, 100);
      } else {
        // Handle highlighting for standalone habits (not in lists)
        setTimeout(() => {
          const habitElement = document.querySelector(`[data-habit-id="${habitId}"]`);
          if (habitElement) {
            habitElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          window.dispatchEvent(new CustomEvent('highlightHabit', { detail: { habitId } }));
        }, 100);
      }
    };

    window.addEventListener('notificationNavigation', handleNotificationNavigation);
    return () => window.removeEventListener('notificationNavigation', handleNotificationNavigation);
  }, []);

  // =======================
  // 💾 Save expandedLists to localStorage
  // =======================
  useEffect(() => {
    localStorage.setItem('expandedLists', JSON.stringify([...expandedLists]));
  }, [expandedLists]);

  function closeGeneralTutorial() {
    setShowGeneralTutorial(false);
    localStorage.setItem('generalTutorialShown', 'true');
    if (showAdAfterTutorial) {
      setShowAdPopup(true);
      setShowAdAfterTutorial(false);
    }
  }

  function closeAdPopup() {
    setShowAdPopup(false);
  }

  // =======================
  // 🔍 Filtro e ordenação
  // =======================
  function parseDateQuery(q) {
    if (!q) return null;
    const s = q.trim();
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (!m) return null;
    const day = String(m[1]).padStart(2, '0');
    const month = String(m[2]).padStart(2, '0');
    const year = m[3];
    return `${year}-${month}-${day}`;
  }

  // Filtrar hábitos isolados
  const filteredActivities = activities
    .filter((a) => a.active)
    .filter((a) => {
      const q = (searchQuery || '').trim().toLowerCase();
      if (!q) return true;
      const qDate = parseDateQuery(q);
      if (a.title?.toLowerCase().includes(q)) return true;
      if (a.desc?.toLowerCase().includes(q)) return true;
      if (qDate && a.time && a.time.includes(qDate)) return true;
      // Buscar por dia (ex: "01" encontra hábitos no dia 01)
      if (/^\d{1,2}$/.test(q) && a.time) {
        const day = a.time.split('-')[2];
        if (day === q.padStart(2, '0')) return true;
      }
      return false;
    });

  // Filtrar listas e seus hábitos
  const filteredLists = lists
    .filter((list) => {
      const q = (searchQuery || '').trim().toLowerCase();
      if (!q) return true;
      // Buscar no nome da lista
      if (list.name?.toLowerCase().includes(q)) return true;
      // Buscar na descrição da lista
      if (list.description?.toLowerCase().includes(q)) return true;
      // Buscar nos hábitos dentro da lista (apenas ativos)
      const hasMatchingHabit = list.habits?.some((h) => {
        if (h.active === false) return false; // Ignorar hábitos inativos
        if (h.title?.toLowerCase().includes(q)) return true;
        if (h.description?.toLowerCase().includes(q)) return true;
        const qDate = parseDateQuery(q);
        if (qDate && h.dueDate && h.dueDate.includes(qDate)) return true;
        // Buscar por dia (ex: "01" encontra hábitos no dia 01)
        if (/^\d{1,2}$/.test(q) && h.dueDate) {
          const day = h.dueDate.split('-')[2];
          if (day === q.padStart(2, '0')) return true;
        }
        return false;
      });
      return hasMatchingHabit;
    })
    .map((list) => {
      const q = (searchQuery || '').trim().toLowerCase();
      const listMatches = !q || list.name?.toLowerCase().includes(q) || list.description?.toLowerCase().includes(q);
      return {
        ...list,
        habits: list.habits?.filter((h) => {
          if (listMatches) {
            return h.active !== false; // Mostrar todos os ativos se a lista corresponde
          }
          // Filtrar hábitos dentro da lista
          if (h.title?.toLowerCase().includes(q)) return true;
          if (h.description?.toLowerCase().includes(q)) return true;
          const qDate = parseDateQuery(q);
          if (qDate && h.dueDate && h.dueDate.includes(qDate)) return true;
          // Buscar por dia (ex: "01" encontra hábitos no dia 01)
          if (/^\d{1,2}$/.test(q) && h.dueDate) {
            const day = h.dueDate.split('-')[2];
            if (day === q.padStart(2, '0')) return true;
          }
          return false;
        }) || [],
      };
    });

  const sortedLists = [...filteredLists].sort((a, b) => {
    if (listSortOption === 'created')
      return new Date(b.createdAt) - new Date(a.createdAt);
    if (listSortOption === 'nameAsc') return a.name.localeCompare(b.name);
    if (listSortOption === 'nameDesc') return b.name.localeCompare(a.name);
    return 0;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortOption === 'created')
      return new Date(b.createdAt) - new Date(a.createdAt);
    const timeA = a.time ? new Date(a.time).getTime() : Infinity;
    const timeB = b.time ? new Date(b.time).getTime() : Infinity;
    if (sortOption === 'dateAsc') return timeA - timeB;
    if (sortOption === 'dateDesc') return timeB - timeA;
    return 0;
  });

  // =======================
  // 🟩 CRUD de hábitos
  // =======================
  async function handleCreateHabit({ title, description, dueDate, dias }) {
    if (!isAuthenticated) {
      setMessage('Para criar hábitos, você precisa estar logado. Faça login ou cadastre-se.');
      setTimeout(() => setMessage(''), 5000);
      return;
    }
    try {
      const payload = {
        title,
        description,
        dueDate,
        userId,
        listId: null,
        dias: dias || [],
        active: true,
      };
      const created = await createHabit(payload);
      const newCard = {
        id: created.id,
        title: created.title,
        desc: created.description || '',
        time: created.dueDate || '',
        repeat: (created.dias && created.dias.length > 0)
          ? created.dias.join(', ')
          : (created.dueDate ? 'Pontual' : 'Não'),
        dias: created.dias || [],
        active: created.active ?? true,
        createdAt: created.createdAt || new Date().toISOString(),
      };
      setActivities((prev) => [...prev, newCard]);
      setMessage('Hábito criado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao criar hábito:', err);
      setMessage('Erro ao criar hábito.');
      setTimeout(() => setMessage(''), 4000);
    }
  }

  async function handleUpdateHabit(id, data) {
    const updated = await updateHabit(id, data);
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? {
        ...a,
        title: updated.title,
        desc: updated.description,
        time: updated.dueDate,
        dias: updated.dias ? (Array.isArray(updated.dias) ? updated.dias : updated.dias.split(',').map(s => s.trim())) : [],
        repeat: (updated.dias && updated.dias.length > 0)
          ? updated.dias.join(', ')
          : (updated.dueDate ? 'Pontual' : 'Não')
      } : a))
    );
    setMessage('Hábito atualizado!');
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleDeleteHabit() {
    if (!selectedHabit) return;
    await deleteHabit(selectedHabit.id);
    setActivities((prev) => prev.filter((a) => a.id !== selectedHabit.id));
    setOpenOptions(false);
    setSelectedHabit(null);
    setMessage('Hábito excluído!');
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleCompleteHabit(id) {
    await updateHabit(id, { active: false });
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: false } : a))
    );
    setMessage('Hábito concluído!');
    setTimeout(() => setMessage(''), 3000);
  }

  // =======================
  // 📋 CRUD de Listas
  // =======================
  async function handleCreateList({ name, description }) {
    if (!isAuthenticated) {
      setMessage('Para criar listas, você precisa estar logado. Faça login ou cadastre-se.');
      setTimeout(() => setMessage(''), 5000);
      return;
    }
    try {
      const created = await createList({ name, description, userId });
      const fullCreated = {
        ...created,
        description: description || created.description || '',
      };
      setLists((prev) => [...prev, fullCreated]);
      setMessage('Lista criada com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao criar lista:', err);
      setMessage('Erro ao criar lista.');
      setTimeout(() => setMessage(''), 4000);
    }
  }

  async function handleUpdateList(id, data) {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    setMessage('Lista atualizada!');
    setTimeout(() => setMessage(''), 3000);
  }

  async function handleDeleteList(id) {
    try {
      await deleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
      setMessage('Lista excluída com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao excluir lista:', err);
      setMessage('Erro ao excluir lista.');
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleOpenList(list) {
    setSelectedListForHabit(list);
    setOpenAddHabitInListModal(true);
  }

  async function handleCreateHabitInList({ title, description, dueDate, listId, userId, dias }) {
    try {
      const created = await createHabitInList({
        title,
        description,
        dueDate,
        listId,
        userId: null, // backend associa via lista
        dias,
      });

      // Atualizar a lista localmente para incluir o novo hábito
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                habits: [
                  ...(l.habits || []),
                  {
                    id: created.id,
                    title: created.title,
                    description: created.description || '',
                    dueDate: created.dueDate,
                    dias: created.dias ? (Array.isArray(created.dias) ? created.dias : created.dias.split(',').map(s => s.trim())) : [],
                    active: created.active ?? true,
                    createdAt: created.createdAt,
                    listId: listId,
                  },
                ],
              }
            : l
        )
      );

      setMessage('Hábito adicionado à lista com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao criar hábito na lista:', err);
      setMessage('Erro ao adicionar hábito à lista.');
      setTimeout(() => setMessage(''), 4000);
    }
  }

  async function handleUpdateHabitInList(id, data) {
    try {
      const updated = await updateHabit(id, data);
      setLists((prev) =>
        prev.map((l) => ({
          ...l,
          habits: l.habits?.map((h) => (h.id === id ? {
            ...h,
            ...data,
            repeat: (data.dias && data.dias.length > 0)
              ? data.dias.join(', ')
              : (data.dueDate ? 'Pontual' : 'Não')
          } : h)) || [],
        }))
      );
      setMessage('Hábito atualizado!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao atualizar hábito na lista:', err);
      setMessage('Erro ao atualizar hábito.');
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleDeleteHabitInList(id) {
    try {
      await deleteHabit(id);
      setLists((prev) =>
        prev.map((l) => ({
          ...l,
          habits: l.habits?.filter((h) => h.id !== id) || [],
        }))
      );
      setOpenHabitOptionsModal(false);
      setSelectedHabitInList(null);
      setMessage('Hábito excluído!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao deletar hábito na lista:', err);
      setMessage('Erro ao excluir hábito.');
      setTimeout(() => setMessage(''), 3000);
    }
  }

  async function handleCompleteHabitInList(listId, habitId) {
  try {
    // Atualiza no backend
    await updateHabit(habitId, { active: false });

    // Atualiza no estado local, apenas a lista certa
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              habits: list.habits?.map((h) =>
                h.id === habitId ? { ...h, active: false } : h
              ) || [],
            }
          : list
      )
    );

    // Fecha modais e limpa seleção
    setOpenHabitOptionsModal(false);
    setSelectedHabitInList(null);

    // Mensagem de sucesso
    setMessage('Hábito concluído!');
    setTimeout(() => setMessage(''), 3000);
  } catch (err) {
    console.error('Erro ao concluir hábito na lista:', err);
    setMessage('Erro ao concluir hábito.');
    setTimeout(() => setMessage(''), 3000);
  }
}

  async function handleCompleteAllHabitsInList(listId) {
    try {
      const list = lists.find(l => l.id === listId);
      if (!list || !list.habits) return;

      const activeHabits = list.habits.filter(h => h.active !== false);
      for (const habit of activeHabits) {
        await updateHabit(habit.id, { active: false });
      }

      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                habits: l.habits?.map((h) => ({ ...h, active: false })) || [],
              }
            : l
        )
      );
      setMessage('Todos os hábitos da lista foram concluídos!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao concluir hábitos da lista:', err);
      setMessage('Erro ao concluir hábitos.');
      setTimeout(() => setMessage(''), 3000);
    }
  }

  function handleCompleteList(listId) {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const hasActiveHabits = list.habits?.some(h => h.active !== false);
    if (hasActiveHabits) {
      setMessage('Ainda há hábitos a serem concluídos.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Adicionar à lista de concluídas no localStorage
    const newCompletedLists = new Set(completedLists);
    newCompletedLists.add(listId);
    setCompletedLists(newCompletedLists);
    localStorage.setItem('completedLists', JSON.stringify([...newCompletedLists]));

    setLists((prev) => prev.filter((l) => l.id !== listId));
    setMessage('Lista concluída!');
    setTimeout(() => setMessage(''), 3000);
  }


  function handleHabitClick(habit) {
    setSelectedHabitInList(habit);
    setOpenHabitOptionsModal(true);
  }

  function handleEditHabitInList() {
    // Mapear os campos do hábito da lista para o formato esperado pelo modal
    setSelectedHabit({
      id: selectedHabitInList.id,
      title: selectedHabitInList.title,
      desc: selectedHabitInList.description || '', // Mapear description para desc
      time: selectedHabitInList.dueDate || '', // Mapear dueDate para time
      dias: selectedHabitInList.dias || [],
      listId: selectedHabitInList.listId, // Adicionar listId para identificar hábitos em listas
    });
    setOpenHabitOptionsModal(false);
    setOpenHabitModal(true);
  }

  // Função geral para atualizar hábitos, diferenciando entre isolados e em listas
  async function handleUpdateHabitGeneral(id, data) {
    if (selectedHabit && selectedHabit.listId) {
      await handleUpdateHabitInList(id, data);
    } else {
      await handleUpdateHabit(id, data);
    }
  }

  // =======================
  // 🎨 Renderização
  // =======================
  return (
    <div className="app">
      <Sidebar />
      <Header searchQuery={searchQuery} onSearch={setSearchQuery} />

      <main className="main">
        {message && <div className="app-message">{message}</div>}

        <div className="columns">
          {/* Painel To-dos */}
          <section className="panel full-height">
            <h3>
              Tarefas
              <span
                className="plus-btn"
                title="Criar novo hábito"
                onClick={() => {
                  setSelectedHabit(null);
                  setOpenHabitModal(true);
                }}
              >
                ＋
              </span>
              <span
                className="info-btn"
                title="Tutorial"
                onClick={() => {
                  showContextualTooltip(
                    'Aqui você pode criar novas Tarefas. Clique em "Entendi" para abrir o modal de criação.',
                    () => {
                      setSelectedHabit(null);
                      setOpenHabitModal(true);
                    },
                    'AddHabit'
                  );
                }}
              >
                ?
              </span>
            </h3>

            <div className="sort-menu-container">
              <label>Ordenar por:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="dark-mode-select"
              >
                <option value="created">Ordem de criação</option>
                <option value="dateAsc">Mais próximos primeiro</option>
                <option value="dateDesc">Mais distantes primeiro</option>
              </select>
            </div>

            <div className="scrollable-content">
              {!isAuthenticated && (
                <div className="activity-card" style={{ backgroundColor: '#ffeb3b', color: '#000', marginBottom: '10px', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <h4>Para criar hábitos, você precisa estar logado.</h4>
                  <p><a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>Faça login aqui</a> ou <a href="/cadastro" style={{ color: '#007bff', textDecoration: 'underline' }}>cadastre-se</a>.</p>
                </div>
              )}
              {loading ? (
                <div>Carregando...</div>
              ) : sortedActivities.length === 0 ? (
                <div style={{ opacity: 0.7, textAlign: 'center', padding: '20px' }}>
                  <p>Você ainda não criou novas Tarefas.</p>
                  <p>Clique no botão "+" acima para adicionar suas tarefas!</p>
                </div>
              ) : (
                sortedActivities.map((a) => (
                  <ActivityCard
                    key={a.id}
                    id={a.id}
                    title={a.title}
                    desc={a.desc}
                    time={a.time}
                    repeat={a.repeat}
                    dias={a.dias}
                    status={a.active ? 'ativo' : 'concluido'}
                    onClick={() => {
                      setSelectedHabit(a);
                      setOpenOptions(true);
                    }}
                    onComplete={handleCompleteHabit}
                  />
                ))
              )}
            </div>
          </section>

          {/* Painel de Listas */}
          <section className="panel full-height" id="habit-list-panel">
            <h3>
              Lista de Tarefas
              <span
                className="plus-btn"
                title="Criar nova lista"
                onClick={() => {
                  setSelectedList(null);
                  setOpenListModal(true);
                }}
              >
                ＋
              </span>
              <span
                className="info-btn"
                title="Tutorial"
                onClick={() => {
                  showContextualTooltip(
                    'Aqui você pode criar novas listas de tarefas. Clique em "Entendi" para abrir o modal de criação.',
                    () => {
                      setSelectedList(null);
                      setOpenListModal(true);
                    },
                    'AddList'
                  );
                }}
              >
                ?
              </span>
            </h3>

            <div className="sort-menu-container">
              <label>Ordenar por:</label>
              <select
                value={listSortOption}
                onChange={(e) => setListSortOption(e.target.value)}
                className="dark-mode-select"
              >
                <option value="created">Ordem de criação</option>
                <option value="nameAsc">Nome A-Z</option>
                <option value="nameDesc">Nome Z-A</option>
              </select>
            </div>

            <div className="scrollable-content">
              {loadingLists ? (
                <div>Carregando listas...</div>
              ) : (
                <HabitList
                  lists={sortedLists}
                  expandedLists={expandedLists}
                  setExpandedLists={setExpandedLists}
                  selectedId={selectedList?.id}
                  onOpen={handleOpenList}
                  onAddHabit={(list) => {
                    setSelectedListForHabit(list);
                    setOpenAddHabitInListModal(true);
                  }}
                  onEdit={(list) => {
                    setSelectedList(list);
                    setOpenListModal(true);
                  }}
                  onDelete={handleDeleteList}
                  onHabitClick={handleHabitClick}
                  onHabitComplete={handleCompleteAllHabitsInList}
                  onHabitCompleteIndividual={handleCompleteHabitInList}
                  onCompleteList={handleCompleteList}
                  onOptions={(list) => {
                    setSelectedListForOptions(list);
                    setOpenListOptionsModal(true);
                  }}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </div>
          </section>

          {/* Painel da IA */}
          <StudyPlan isAuthenticated={isAuthenticated} type="faq" />
        </div>
      </main>

      <AddHabitModal
        open={openHabitModal}
        onClose={() => setOpenHabitModal(false)}
        onCreated={handleCreateHabit}
        onUpdated={handleUpdateHabitGeneral}
        habit={selectedHabit}
      />

      <AddListModal
        open={openListModal}
        onClose={() => {
          setOpenListModal(false);
          setSelectedList(null);
        }}
        onCreate={handleCreateList}
        onUpdate={handleUpdateList}
        list={selectedList}
      />

      <ActivityOptionsModal
        open={openOptions}
        onClose={() => setOpenOptions(false)}
        onDelete={handleDeleteHabit}
        onEdit={() => {
          setOpenOptions(false);
          setOpenHabitModal(true);
        }}
      />

      <AddHabitInListModal
        open={openAddHabitInListModal}
        onClose={() => {
          setOpenAddHabitInListModal(false);
          setSelectedListForHabit(null);
        }}
        onCreate={handleCreateHabitInList}
        presetList={selectedListForHabit}
      />

      <HabitOptionsModal
        open={openHabitOptionsModal}
        onClose={() => {
          setOpenHabitOptionsModal(false);
          setSelectedHabitInList(null);
        }}
        onDelete={() => handleDeleteHabitInList(selectedHabitInList?.id)}
        onEdit={handleEditHabitInList}
        onComplete={() => handleCompleteHabitInList(selectedHabitInList?.listId, selectedHabitInList?.id)}
      />

      <EditHabitInListModal
        open={openEditHabitInListModal}
        onClose={() => {
          setOpenEditHabitInListModal(false);
          setSelectedHabitInList(null);
        }}
        onUpdate={handleUpdateHabitInList}
        habit={selectedHabitInList}
      />

      <ListOptionsModal
        open={openListOptionsModal}
        onClose={() => {
          setOpenListOptionsModal(false);
          setSelectedListForOptions(null);
        }}
        onAddHabit={() => {
          setSelectedListForHabit(selectedListForOptions);
          setOpenAddHabitInListModal(true);
          setOpenListOptionsModal(false);
        }}
        onDelete={() => handleDeleteList(selectedListForOptions?.id)}
        onEdit={() => {
          setSelectedList(selectedListForOptions);
          setOpenListModal(true);
          setOpenListOptionsModal(false);
        }}
        onComplete={() => handleCompleteList(selectedListForOptions?.id)}
        list={selectedListForOptions}
      />

      {showTooltip && (
        <ContextualTooltip
          show={true}
          message={tooltipMessage}
          onConfirm={tooltipOnConfirm}
          onClose={closeTooltip}
        />
      )}

      {showGeneralTutorial && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            color: '#fff',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              backgroundColor: '#333',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
            }}
          >
            <h2>Bem-vindo ao Rotinalize!</h2>
            <p>Esta é uma aplicação para gerenciar suas Tarefas e listas de tarefas.</p>
            <ul style={{ textAlign: 'left', listStyleType: 'disc', paddingLeft: '20px' }}>
              <li><strong>Tarefas:</strong> Crie tarefas individuais aqui. Use o botão "+" para adicionar novas tarefaas.</li>
              <li><strong>Lista de Tarefas:</strong> Organize Tarefas em listas. Crie listas e adicione Tarefas a elas.</li>
              <li><strong>Painel da IA:</strong> Converse com a IA para obter dicas e sugestões sobre produtividade.</li>
              <li>Use a barra de pesquisa para encontrar Tarefas ou listas rapidamente.</li>
              <li>Visualize seus hábitos no calendário para acompanhar o progresso.</li>
              <li>Clique nos botões "?" para obter tutoriais contextuais sobre funcionalidades específicas.</li>
            </ul>
            <p>Explore e comece a organizar sua rotina!</p>
            <button
              onClick={closeGeneralTutorial}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#6fbe8c',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {showAdPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            color: '#fff',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '450px',
              backgroundColor: '#333',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
            }}
          >
            <h2>Patrocínio</h2>
            <img src={adImage} alt="Patrocínio" style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }} />
            <p>Obrigado por usar o Rotinalize! Apoie nossos patrocinadores para manter a aplicação gratuita.</p>
            <button
              onClick={closeAdPopup}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#6fbe8c',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
