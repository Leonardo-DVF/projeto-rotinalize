import React, { useState, useEffect } from 'react'

export default function AddHabitModal({ open, onClose, onCreated, onUpdated, habit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [selectedDays, setSelectedDays] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [habitType, setHabitType] = useState('pontual') // 'pontual' or 'recorrente'

  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

  useEffect(() => {
    if (habit) {
      setTitle(habit.title || '')
      setDescription(habit.desc || '')
      setDate(habit.time || '')
      setSelectedDays(habit.dias ? (Array.isArray(habit.dias) ? habit.dias : habit.dias.split(',')) : [])
      setHabitType(habit.dias && habit.dias.length > 0 ? 'recorrente' : 'pontual')
    } else {
      setTitle('')
      setDescription('')
      setDate('')
      setSelectedDays([])
      setHabitType('pontual')
    }
  }, [habit, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) return setError('Título é obrigatório.')

    if (!description.trim()) return setError('Descrição é obrigatória.')

    if (habitType === 'pontual' && !date) return setError('Selecione uma data para tarefa pontual.')
    if (habitType === 'recorrente' && selectedDays.length === 0) return setError('Selecione pelo menos um dia da semana para tarefa recorrente.')

    setLoading(true)

    const habitData = {
      title: title.trim(),
      description: description.trim(),
      dueDate: habitType === 'pontual' ? date : null,
      dias: habitType === 'recorrente' ? selectedDays : null,
      userId: "53d1a0ca-12b1-49f1-9b04-e67bb09d7a6f"
    };

    try {
      if (habit) {
        await onUpdated(habit.id, habitData)
        onClose()
      } else {
        await onCreated(habitData)
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Falha ao salvar o hábito.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal habit-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{habit ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Título*
            <input
              className="input"
              placeholder="Ex: Prova de fisica"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </label>
          <label>
            Descrição*
            <textarea
              className="textarea"
              placeholder="Ex: Tenho que focar para aprender"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </label>
          <label>
            Tipo de tarefa*
            <div className="habit-type-selection">
              <label className="radio-option">
                <input
                  type="radio"
                  value="pontual"
                  checked={habitType === 'pontual'}
                  onChange={e => {
                    setHabitType(e.target.value);
                    setSelectedDays([]);
                    setDate('');
                  }}
                />
                Pontual (com data específica)
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="recorrente"
                  checked={habitType === 'recorrente'}
                  onChange={e => {
                    setHabitType(e.target.value);
                    setDate('');
                    setSelectedDays([]);
                  }}
                />
                Recorrente (diária/semanal)
              </label>
            </div>
          </label>
          {habitType === 'pontual' && (
            <label>
              Data*
              <input
                className="input"
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => {
                  const selected = e.target.value
                  const today = new Date().toISOString().split('T')[0]

                  if (selected && selected < today) {
                    setError('⚠️ A data deve ser hoje ou futura.')
                  } else {
                    setError('')
                    setDate(selected)
                  }
                }}
              />
            </label>
          )}

          {habitType === 'recorrente' && (
            <label>
              Dias da semana*
              <div className="days-selection">
                {daysOfWeek.map(day => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedDays(prev => [...prev, day])
                        } else {
                          setSelectedDays(prev => prev.filter(d => d !== day))
                        }
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </label>
          )}

          {error && <div className="error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save" disabled={loading}>{loading ? 'Salvando...' : (habit ? 'Salvar alterações' : 'Criar')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
