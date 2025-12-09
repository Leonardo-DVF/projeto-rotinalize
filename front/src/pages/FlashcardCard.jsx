import React, { useState } from "react";

export default function FlashcardCard({ question, answer, onEdit, onDelete }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="card">
      <p className="question-div">{question}</p>
      <a
        href="#"
        className="show-hide-btn"
        onClick={(e) => {
          e.preventDefault();
          setShowAnswer(!showAnswer);
        }}
      >
        Mostrar/Ocultar
      </a>

      {showAnswer && <p className="answer-div">{answer}</p>}

      <div className={`deck-actions ${!showAnswer ? 'hidden-answer' : ''}`}>
        <button onClick={onEdit}>Editar</button>
        <button onClick={onDelete}>Excluir</button>
      </div>
    </div>
  );
}
