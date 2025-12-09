// src/components/EditHabitInListModal.jsx
import React, { useEffect, useState, useMemo } from 'react';

export default function EditHabitInListModal({ open, onClose, onUpdate, habit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [error, setError] = useState('');

  const minDate = useMemo(() => {
    const today = new Date();
    return today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  }, []);

  useEffect(() => {
    if (open && habit) {
      setTitle(habit.title || '');
      setDescription(habit.description || '');
      setDueDate(habit.dueDate || '');
      setSelectedDays(habit.dias || []);
      setError('');
    }
  }, [open, habit]);

  if (!open) return null;

  function validate() {
    if (!title || !title.trim()) {
      setError('O título é obrigatório.');
      return false;
    }
    if (!description || !description.trim()) {
      setError('A descrição é obrigatória.');
      return false;
    }
    if (!dueDate && selectedDays.length === 0) {
      setError('Selecione uma data ou dias da semana.');
      return false;
    }
    if (dueDate && selectedDays.length > 0) {
      setError('Selecione apenas data OU dias da semana, não ambos.');
      return false;
    }
    setError('');
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    let finalDueDate = null;
    let finalDias = null;

    if (dueDate) {
      const date = new Date(dueDate + 'T12:00:00'); // Set to noon to avoid timezone shift
      finalDueDate = date.toISOString().split('T')[0];
    } else if (selectedDays.length > 0) {
      finalDias = selectedDays;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueDate: finalDueDate,
      dias: finalDias,
    };

    try {
      await onUpdate(habit.id, payload);
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar hábito na lista:', err);
      setError('Erro ao atualizar hábito. Verifique a conexão.');
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal dark-mode-modal" style={{ width: 'min(560px, 94vw)' }}>
        <h3>Editar hábito na lista</h3>

        {error && <div className="error">{error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Título*
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="dark-mode-input" />
          </label>

          <label>
            Descrição*
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="dark-mode-textarea" />
          </label>

          <label>
            Data (opcional)
            <input type="date" value={dueDate} min={minDate} onChange={(e) => {
              const selected = e.target.value;
              if (selected) {
                setDueDate(selected);
                setSelectedDays([]); // Clear days when date is selected
              } else {
                setDueDate('');
              }
            }} className="dark-mode-input" />
          </label>

          <label>
            Dias da semana {dueDate ? '(opcional se data selecionada)' : '*'}
            <div className="days-selection">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((day, index) => (
                <label key={day} className="day-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(index)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedDays(prev => [...prev, index]);
                        setDueDate(''); // Clear date when days are selected
                      } else {
                        setSelectedDays(prev => prev.filter(d => d !== index));
                      }
                    }}
                  />
                  {day}
                </label>
              ))}
            </div>
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-cancel dark-mode-btn" onClick={() => onClose()}>Cancelar</button>
            <button type="submit" className="btn-save dark-mode-btn">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
