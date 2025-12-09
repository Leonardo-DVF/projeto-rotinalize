import React, { useState, useEffect } from 'react';

export default function ListModal({ open, onClose, onCreate, initial }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initial?.name || '');
  }, [initial, open]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate({ name: name.trim() });
      setName('');
    } catch (err) {
      console.error('Erro ao criar lista', err);
      alert('Erro ao criar lista. Veja console.');
    } finally {
      setSaving(false);
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <h3>Novo Grupo / Lista</h3>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Nome da lista*
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Rotina Matinal" />
          </label>

          <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
