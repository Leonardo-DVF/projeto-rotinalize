import React, { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import Sidebar from '../components/Sidebar.jsx'
import ActivityCard from '../components/ActivityCard.jsx'
import AddHabitModal from '../components/AddHabitModal.jsx'
import ActivityOptionsModal from '../components/ActivityOptionsModal.jsx'
import ContextualTooltip from '../components/ContextualTooltip.jsx'
import { getHabits, createHabit, updateHabit, deleteHabit } from '../api.js'

const ACTIVE_GOAL_CREATION_DATE_KEY = 'activeGoalCreationDate';

export default function Todos() {
  const [openModal, setOpenModal] = useState(false)
  const [openOptions, setOpenOptions] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('created')

  // Contextual tooltip state
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipMessage, setTooltipMessage] = useState('')
  const [tooltipOnConfirm, setTooltipOnConfirm] = useState(null)
  const [tooltipKey, setTooltipKey] = useState('')

  function closeTooltip() {
    setShowTooltip(false)
    if (tooltipKey) {
      localStorage.setItem(`tutorial${tooltipKey}Shown`, 'true')
    }
    setTooltipMessage('')
    setTooltipOnConfirm(null)
    setTooltipKey('')
  }

  function showContextualTooltip(message, onConfirm, key) {
    setTooltipMessage(message)
    setTooltipOnConfirm(() => onConfirm)
    setTooltipKey(key)
    setShowTooltip(true)
  }

  useEffect(() => {
    async function load() {
      try {
        const data = await getHabits()
        const activeGoalCreationDate = localStorage.getItem(ACTIVE_GOAL_CREATION_DATE_KEY)
        const mapped = (data || [])
          .filter((h) => !h.listId) // Filtrar apenas hábitos isolados (sem listId)
          .filter(h => {
            if (!activeGoalCreationDate) return true;
            if (!h.createdAt) return true;
            return new Date(h.createdAt) >= new Date(activeGoalCreationDate);
          })
          .map(h => ({
            id: h.id,
            title: h.title,
            desc: h.description || '',
            time: h.dueDate || '',
            repeat: (h.dias && h.dias.length > 0)
              ? h.dias.join(', ')
              : (h.dueDate ? 'Pontual' : 'Não'),
            dias: h.dias ? (Array.isArray(h.dias) ? h.dias : h.dias.split(',').map(s => s.trim())) : [],
            active: h.active !== undefined ? h.active : true,
            createdAt: h.createdAt || new Date().toISOString()
          }))
        setActivities(mapped)
      } catch (err) {
        console.error('Erro ao carregar hábitos:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // 🔍 Busca
  function parseDateQuery(q) {
    if (!q) return null
    const s = q.trim()
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (!m) return null
    const day = String(m[1]).padStart(2, '0')
    const month = String(m[2]).padStart(2, '0')
    const year = m[3]
    return `${year}-${month}-${day}`
  }

  const filteredActivities = activities
    .filter(a => a.active)
    .filter(a => {
      const q = (searchQuery || '').trim().toLowerCase()
      if (!q) return true

      const qDate = parseDateQuery(q)
      if (a.title && a.title.toLowerCase().includes(q)) return true
      if (a.desc && a.desc.toLowerCase().includes(q)) return true
      if (qDate && a.time && a.time.includes(qDate)) return true

      if (a.time) {
        const [year, month, day] = a.time.split('-')
        if (year.includes(q) || month.includes(q) || day.includes(q)) return true
        if (a.time.toLowerCase().includes(q)) return true
      }

      return false
    })

  // 🔃 Ordenação
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortOption === 'created') return new Date(b.createdAt) - new Date(a.createdAt)

    const timeA = a.time ? new Date(a.time).getTime() : Infinity
    const timeB = b.time ? new Date(b.time).getTime() : Infinity

    if (sortOption === 'dateAsc') return timeA - timeB
    if (sortOption === 'dateDesc') return timeB - timeA
    return 0
  })

  // 🆕 Criar hábito
  async function handleCreateHabit({ title, description, dueDate, dias }) {
    try {
      const payload = {
        title,
        description,
        dueDate,
        userId: "c659c1c4-cd84-4bba-a950-8f3918917e83", // troque conforme seu usuário
        listId: null,
        dias: dias,
        active: true
      }

      const created = await createHabit(payload)
      const newCard = {
        id: created.id,
        title: created.title,
        desc: created.description || '',
        time: created.dueDate || '',
        repeat: (created.dias && created.dias.length > 0)
          ? created.dias.join(', ')
          : (created.dueDate ? 'Pontual' : 'Não'),
        dias: created.dias ? (Array.isArray(created.dias) ? created.dias : created.dias.split(',').map(s => s.trim())) : [],
        active: created.active ?? true,
        createdAt: created.createdAt || new Date().toISOString()
      }

      setActivities(prev => [...prev, newCard])
      setMessage('Hábito criado com sucesso!')
      setTimeout(() => setMessage(''), 3000)
      return created
    } catch (err) {
      console.error('Erro ao criar hábito:', err)
      const userMsg = err.body ? `Erro do servidor: ${err.body}` : (err.message || 'Erro desconhecido')
      setMessage(userMsg)
      setTimeout(() => setMessage(''), 5000)
    }
  }

  // ✏️ Atualizar
  async function handleUpdateHabit(id, data) {
    const updated = await updateHabit(id, data)
    setActivities(prev => prev.map(a => a.id === id ? {
      ...a,
      title: updated.title,
      desc: updated.description,
      time: updated.dueDate,
      dias: updated.dias ? (Array.isArray(updated.dias) ? updated.dias : updated.dias.split(',').map(s => s.trim())) : [],
      repeat: (updated.dias && updated.dias.length > 0)
        ? updated.dias.join(', ')
        : (updated.dueDate ? 'Pontual' : 'Não')
    } : a))
    setMessage('Hábito atualizado com sucesso!')
    setTimeout(() => setMessage(''), 3000)
    return updated
  }

  // ❌ Deletar
  async function handleDeleteHabit() {
    if (!selectedHabit) return
    try {
      await deleteHabit(selectedHabit.id)
      setActivities(prev => prev.filter(a => a.id !== selectedHabit.id))
      setOpenOptions(false)
      setSelectedHabit(null)
      setMessage('Hábito excluído com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Erro ao deletar:', err)
      setMessage('Erro ao excluir hábito.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // ✅ Concluir
  async function handleCompleteHabit(id) {
    try {
      const updated = await updateHabit(id, { active: false })
      setActivities(prev => prev.map(a => (a.id === id ? { ...a, active: false } : a)))
      setMessage('Hábito concluído com sucesso!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Erro ao concluir hábito:', err)
      setMessage('Erro ao concluir hábito.')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="app">
      <Sidebar />
      <Header searchQuery={searchQuery} onSearch={setSearchQuery} />

      <main className="main">
        <h2>📋 Tarefas individuais</h2>

        {message && <div className="app-message">{message}</div>}

        <section className="panel">
          <h3>
            Tarefas
            <span
              className="plus-btn"
              title="Criar novo hábito"
              onClick={() => { setSelectedHabit(null); setOpenModal(true) }}
            >
              ＋
            </span>
            <span
              className="info-btn"
              title="Tutorial"
              onClick={() => {
                showContextualTooltip(
                  'Aqui você pode criar novas tarefas individuais. Clique em "Entendi" para abrir o modal de criação.',
                  () => {
                    setSelectedHabit(null);
                    setOpenModal(true);
                  },
                  'AddHabitTodos'
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

          {loading ? (
            <div>Carregando...</div>
          ) : sortedActivities.length === 0 ? (
            <div style={{ opacity: 0.7, textAlign: 'center', padding: '20px' }}>
              <p>Você ainda não criou novas tarefas.</p>
                  <p>Clique no botão "+" acima para adicionar suas tarefas!</p>
            </div>
          ) : (
            sortedActivities.map(a => (
              <ActivityCard
                key={a.id}
                id={a.id}
                title={a.title}
                desc={a.desc}
                time={a.time}
                repeat={a.repeat}
                dias={a.dias}
                status={a.active ? 'ativo' : 'concluido'}
                onClick={() => { setSelectedHabit(a); setOpenOptions(true) }}
                onComplete={handleCompleteHabit}
              />
            ))
          )}
        </section>
      </main>

      <AddHabitModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={handleCreateHabit}
        onUpdated={handleUpdateHabit}
        habit={selectedHabit}
      />

      <ActivityOptionsModal
        open={openOptions}
        onClose={() => setOpenOptions(false)}
        onDelete={handleDeleteHabit}
        onEdit={() => { setOpenOptions(false); setOpenModal(true) }}
      />

      <ContextualTooltip
        show={showTooltip}
        message={tooltipMessage}
        onConfirm={tooltipOnConfirm}
        onClose={closeTooltip}
      />
    </div>
  )
}
