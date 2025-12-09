import React, { useState } from 'react';
import HabitCard from './HabitCard.jsx';

export default function ListCard({ list, selected = false, onOpen, onEdit, onDelete, onAddHabit, onHabitClick, onHabitComplete, onHabitDelete, onHabitCompleteIndividual, onCompleteList, onOptions, expandedLists, setExpandedLists }) {
  const expanded = expandedLists ? expandedLists.has(list.id) : false;

  const toggleExpanded = () => {
    if (setExpandedLists) {
      setExpandedLists(prev => {
        const newSet = new Set(prev);
        if (newSet.has(list.id)) {
          newSet.delete(list.id);
        } else {
          newSet.add(list.id);
        }
        return newSet;
      });
    }
  };

  return (
    <div
      className={`list-card ${selected ? 'selected' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="list-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}
        onClick={toggleExpanded}
      >
        <div style={{ flex: 1 }}>
          {/* Título da lista */}
          <div className="list-title">{list.name || 'Sem título'}</div>

          {/* Descrição da lista */}
          <div className="list-desc" style={{ marginTop: 4 }}>
            {list.description && list.description.trim() !== ''
              ? list.description
              : <span style={{ opacity: 0.6 }}>Sem descrição</span>}
          </div>

          {/* Meta / data de criação */}
          <div className="list-meta" style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
            Criada: {list.createdAt ? new Date(list.createdAt).toLocaleDateString() : '-'}
          </div>
        </div>

        {/* Botão de opções */}
        <div className="list-actions" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-add-habit"
            title="Adicionar Tarefa"
            onClick={() => onAddHabit && onAddHabit(list)}
          >
            ➕ Criar Tarefa
          </button>
          <button
            className="btn-complete-list"
            title="Concluir Lista"
            onClick={() => onCompleteList && onCompleteList(list.id)}
          >
            ✅ Concluir Lista
          </button>
          <button
            className="btn-options"
            title="Opções da lista"
            onClick={() => onOptions && onOptions(list)}
          >
            ⋮
          </button>
        </div>
      </div>

      {/* Preview dos hábitos (se houver) */}
      {expanded ? (
        list.habits && list.habits.filter(h => h.active !== false).length > 0 ? (
          <div className="habits-expanded" style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {list.habits.filter(h => h.active !== false).map((h) => (
              <HabitCard
                key={h.id}
                id={h.id}
                title={h.title}
                desc={h.description || ''}
                time={h.dueDate || ''}
                repeat={
                  (() => {
                    const diasArray = h.dias ? (Array.isArray(h.dias) ? h.dias : h.dias.toString().split(',').map(d => parseInt(d.trim()))) : [];
                    return diasArray.length > 0 ? diasArray.join(', ') : (h.dueDate ? 'Pontual' : 'Não');
                  })()
                }
                dias={h.dias || []}
                active={h.active !== undefined ? h.active : true}
                onClick={() => onHabitClick && onHabitClick(h)}
                onComplete={(habitId) => onHabitCompleteIndividual && onHabitCompleteIndividual(list.id, habitId)}
              />
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '10px' }}>
            <p>Nenhum hábito nesta lista.</p>
            <p>Clique no botão "➕ Criar Hábito" acima para adicionar novos hábitos!</p>
          </div>
        )
      ) : null}
    </div>
  );
}
