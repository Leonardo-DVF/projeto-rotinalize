import React, { useEffect, useState } from 'react';

export default function HabitCard({ id, title, desc, time, repeat, dias, active, onClick, onComplete }) {
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    const highlightId = localStorage.getItem('highlightHabitId');
    if (highlightId && highlightId == id) {
      setIsHighlighted(true);
      localStorage.removeItem('highlightHabitId');
      setTimeout(() => setIsHighlighted(false), 3000); // Highlight for 3 seconds
    }

    const handleHighlight = (event) => {
      if (event.detail.habitId == id) {
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), 3000);
      }
    };

    window.addEventListener('highlightHabit', handleHighlight);
    return () => window.removeEventListener('highlightHabit', handleHighlight);
  }, [id]);
  const getStatusColor = () => {
    if (active === false) return 'green';

    if (!time) {
      // Recorrente por dias da semana
      if (!dias || dias.length === 0) return 'gray';

      const today = new Date();
      const dayIndex = today.getDay(); // 0 = Domingo, 1 = Segunda, etc.

      const dayMap = {
        'DOM': 0,
        'SEG': 1,
        'TER': 2,
        'QUA': 3,
        'QUI': 4,
        'SEX': 5,
        'SAB': 6
      };

      const habitDays = dias.map(d => dayMap[d]).sort((a, b) => a - b);
      let nextDay = null;
      for (let d of habitDays) {
        if (d >= dayIndex) {
          nextDay = d;
          break;
        }
      }
      if (nextDay === null) {
        nextDay = habitDays[0] + 7; // próxima semana
      }
      const daysUntil = nextDay - dayIndex;

      if (daysUntil === 0) return 'red';
      if (daysUntil <= 2) return 'orange';
      return 'green';
    } else {
      // Com dueDate
      const today = new Date();
      const due = new Date(time);
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

      if (diffDays > 2) return 'green';
      if (diffDays === 2 || diffDays === 1) return 'orange';
      if (diffDays === 0) return 'red';
      return 'gray';
    }
  };

  const isCompleted = active === false;

  return (
    <div
      className={`activity-card ${isCompleted ? 'completed' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      data-habit-id={id}
      onClick={() => onClick?.(id)}
      style={{ position: 'relative', opacity: isCompleted ? 0.7 : 1 }}
    >
      {/* Indicador de status */}
      <span
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
        }}
      />

      <div className="activity-header">
        <h4 className="activity-title">
          {title} {isCompleted && <span style={{ color: 'green' }}>✓</span>}
        </h4>
      </div>

      <p className="activity-desc">{desc}</p>

      {!isCompleted && (
        <button
          className="complete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onComplete?.(id); // ✅ Chamamos a função que o pai passar
          }}
        >
          Concluir
        </button>
      )}

      <div className="activity-footer">
        {time && <span>📅 {time}</span>}
        {repeat && <span>🔁 {repeat}</span>}
      </div>
    </div>
  );
}
