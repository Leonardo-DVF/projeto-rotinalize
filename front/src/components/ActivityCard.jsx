import React, { useEffect, useState } from 'react'

export default function ActivityCard({ id, title, desc, time, repeat, dias, status, onClick, onComplete }) {
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
    if (status === 'concluido') return '#22c55e'; // green

    if (!time) {
      if (!dias || dias.length === 0) return '#6b7280'; // gray

      const today = new Date()
      const dayIndex = today.getDay()

      const dayMap = {
        'DOM': 0,
        'SEG': 1,
        'TER': 2,
        'QUA': 3,
        'QUI': 4,
        'SEX': 5,
        'SAB': 6
      }

      const habitDays = dias.map(d => dayMap[d]).sort((a, b) => a - b)
      let nextDay = null
      for (let d of habitDays) {
        if (d >= dayIndex) {
          nextDay = d
          break
        }
      }
      if (nextDay === null) {
        nextDay = habitDays[0] + 7
      }
      const daysUntil = nextDay - dayIndex

      if (daysUntil === 0) return '#ef4444'; // red
      if (daysUntil <= 2) return '#f59e0b'; // orange
      return '#22c55e'; // green
    } else {
      const today = new Date()
      const due = new Date(time)
      const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

      if (diffDays > 2) return '#22c55e';
      if (diffDays === 2 || diffDays === 1) return '#f59e0b';
      if (diffDays === 0) return '#ef4444';
      return '#6b7280';
    }
  }

  const isCompleted = status === 'concluido'

  return (
    <div
      className={`activity-card ${isCompleted ? 'completed' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      data-habit-id={id}
      onClick={() => onClick(id)}
      style={{ position: 'relative', opacity: isCompleted ? 0.7 : 1, userSelect: 'none' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(id) }}
    >
      <span
        aria-label="Status Indicator"
        role="presentation"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          boxShadow: `0 0 6px ${getStatusColor()}99`
        }}
      />
      <div className="activity-header">
        <h4 className="activity-title">
          {title} {isCompleted && <span title="Concluído" style={{ color: '#22c55e' }}>✓</span>}
        </h4>
      </div>
      <p className="activity-desc">{desc}</p>
      {!isCompleted && (
        <button
          type="button"
          className="complete-btn"
          onClick={(e) => {
            e.stopPropagation()
            onComplete(id)
          }}
          aria-label={`Concluir ${title}`}
        >
          Concluir
        </button>
      )}
      <div className="activity-footer">
        {time && <span>📅 {time}</span>}
        {repeat && <span>🔁 {repeat}</span>}
      </div>
    </div>
  )
}
