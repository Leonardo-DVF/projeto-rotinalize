import React, { useEffect, useState, useMemo } from 'react';

export default function AddHabitInListModal({ open, onClose, onCreate, presetList }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('punctual'); // 'recurring' or 'punctual'
  const [dueDate, setDueDate] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  const [error, setError] = useState('');

  const minDate = useMemo(() => {
    const today = new Date();
    return (
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0')
    );
  }, []);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setTaskType('punctual');
      setDueDate('');
      setSelectedDays([]);
      setError('');
    }
  }, [open, presetList]);

  if (!open) return null;

  function validate() {
    if (!title.trim()) {
      setError('O título é obrigatório.');
      return false;
    }
    if (!description.trim()) {
      setError('A descrição é obrigatória.');
      return false;
    }
    if (!taskType) {
      setError('Selecione se a tarefa é recorrente ou pontual.');
      return false;
    }
    if (taskType === 'punctual' && !dueDate) {
      setError('Selecione uma data para a tarefa pontual.');
      return false;
    }
    if (taskType === 'recurring' && selectedDays.length === 0) {
      setError('Selecione pelo menos um dia da semana para a tarefa recorrente.');
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
      // ✅ Corrige o problema de fuso horário (evita o "um dia antes")
      const date = new Date(dueDate);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      finalDueDate = date.toISOString().split('T')[0]; // garante a data correta localmente
    } else if (selectedDays.length > 0) {
      finalDias = selectedDays;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueDate: finalDueDate,
      listId: presetList?.id || null,
      userId: null, // o backend associa via lista
      dias: finalDias,
    };

    try {
      await onCreate(payload);
      onClose();
    } catch (err) {
      console.error('Erro ao criar hábito na lista:', err);
      setError('Erro ao criar hábito. Verifique a conexão.');
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal dark-mode-modal" style={{ width: 'min(560px, 94vw)' }}>
        <h3>
          Criar tarefa da lista
          {presetList ? `: ${presetList.name}` : ''}
        </h3>

        {error && <div className="error">{error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Título*
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="dark-mode-input"
              placeholder="Ex: Ler 10 páginas de um livro"
            />
          </label>

          <label>
            Descrição*
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dark-mode-textarea"
              placeholder="Detalhe o objetivo desta tarefa..."
            />
          </label>

          <label>
            Tipo de tarefa*
            <div className="habit-type-selection">
              <label className="radio-option">
                <input
                  type="radio"
                  value="punctual"
                  checked={taskType === 'punctual'}
                  onChange={e => {
                    setTaskType(e.target.value)
                    setSelectedDays([])
                    setDueDate('')
                  }}
                />
                Pontual (com data específica)
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="recurring"
                  checked={taskType === 'recurring'}
                  onChange={e => {
                    setTaskType(e.target.value)
                    setDueDate('')
                    setSelectedDays([])
                  }}
                />
                Recorrente (diária/semanal)
              </label>
            </div>
          </label>

          {taskType === 'recurring' && (
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
                          setSelectedDays(prev => [...prev, day]);
                        } else {
                          setSelectedDays(prev => prev.filter(d => d !== day));
                        }
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </label>
          )}

          {taskType === 'punctual' && (
            <label>
              Data*
              <input
                type="date"
                value={dueDate}
                min={minDate}
                onChange={(e) => {
                  const selected = e.target.value;
                  const today = new Date().toISOString().split("T")[0];

                  if (selected && selected < today) {
                    setError("⚠️ A data deve ser hoje ou futura.");
                  } else {
                    setError("");
                    setDueDate(selected);
                  }
                }}
                className="dark-mode-input"
              />
            </label>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel dark-mode-btn"
              onClick={() => onClose()}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-save dark-mode-btn">
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
