import React, { useState, useEffect } from "react";

export default function FlashcardForm({ onSave, onClose, initialData }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.frontText);
      setAnswer(initialData.backText);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!question.trim() || !answer.trim()) {
      setError(true);
      return;
    }
    setError(false);
    onSave({ question, answer });
    setQuestion("");
    setAnswer("");
  };

  return (
    <div className="question-container">
      <h2>{initialData ? "Editar Cartão" : "Adicionar Cartão"}</h2>
      <div className="wrapper">
        <div className="error-con">
          {error && <span id="error">Os campos de entrada não podem estar vazios!</span>}
        </div>
      </div>

      <label>Pergunta:</label>
      <textarea
        className="input"
        placeholder="Digite a pergunta aqui..."
        rows="2"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <label>Resposta:</label>
      <textarea
        className="input"
        placeholder="Digite a resposta aqui..."
        rows="4"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1em' }}>
        <button onClick={onClose} style={{ backgroundColor: 'var(--danger, #e74c3c)', color: 'white', padding: '0.8em 2em', borderRadius: '0.3em', fontWeight: '600', border: 'none', cursor: 'pointer', marginRight: '1em' }}>
          Cancelar
        </button>
        <button id="save-btn" onClick={handleSubmit} style={{ padding: '0.8em 2em' }}>
          Salvar
        </button>
      </div>
    </div>
  );
}
