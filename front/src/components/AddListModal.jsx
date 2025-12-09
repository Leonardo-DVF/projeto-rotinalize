import React, { useEffect, useState } from 'react'

export default function AddListModal({ open, onClose, onCreate, onUpdate, list }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setName(list?.name ?? '')
      setDescription(list?.description ?? '')
      setError('')
    }
  }, [open, list])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('O nome da lista é obrigatório.')
      return
    }

    try {
      if (list && list.id) {
        await onUpdate(list.id, { name: name.trim(), description: description.trim() })
      } else {
        await onCreate({ name: name.trim(), description: description.trim() })
      }
      onClose()
    } catch (err) {
      console.error('Erro ao salvar lista:', err)
      setError('Erro ao salvar a lista.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card list-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{list ? 'Editar Lista' : 'Novo Hábito (Lista)'}</h3>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>Título*</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da lista"
            autoFocus
          />

          <label>Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione uma descrição (opcional)"
            rows={4}
          />

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">{list ? 'Salvar Alterações' : 'Criar Lista'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
