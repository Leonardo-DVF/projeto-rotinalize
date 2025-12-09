import React from 'react';

export default function ListOptionsModal({ open, onClose, onAddHabit, onDelete, onEdit, onComplete, list }) {
  if (!open || !list) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal options-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Opções da Lista: {list.name}</h3>
        <div className="options-actions">
          <button onClick={() => { onAddHabit && onAddHabit(); onClose(); }} className="btn-add">➕ Adicionar Hábito</button>
          <button onClick={() => { onEdit && onEdit(); onClose(); }} className="btn-edit">✏️ Editar</button>
          <button onClick={() => { onComplete && onComplete(); onClose(); }} className="btn-complete">🏁 Concluir</button>
          <button onClick={() => { onDelete && onDelete(); onClose(); }} className="btn-delete">🗑️ Excluir</button>
          <button onClick={onClose} className="btn-cancel">❌ Cancelar</button>
        </div>
      </div>
    </div>
  );
}
