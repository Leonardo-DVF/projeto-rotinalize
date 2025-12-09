import React from "react"

export default function HabitOptionsModal({ open, onClose, onDelete, onEdit, onComplete }) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal options-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Opções do hábito</h3>
        <div className="options-actions">
          <button onClick={onEdit} className="btn-edit">✏️ Editar</button>
          <button onClick={onDelete} className="btn-delete">🗑️ Excluir</button>
          <button onClick={onClose} className="btn-cancel">❌ Cancelar</button>
        </div>
      </div>
    </div>
  )
}
