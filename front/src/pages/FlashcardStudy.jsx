import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCardsToReviewToday, reviewFlashcard } from "../api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/flashcards.css";

export default function FlashcardStudy() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studying, setStudying] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    loadCardsToReview();
  }, []);

  const loadCardsToReview = async () => {
    try {
      const cardsToReview = await getCardsToReviewToday();
      setCards(cardsToReview);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar cards para revisão:", error);
      setCards([]);
      setLoading(false);
    }
  };

  const handleReview = async (difficulty) => {
    if (cards.length === 0) return;

    const currentCard = cards[currentCardIndex];
    let reviewSuccess = false;

    try {
      await reviewFlashcard(currentCard.id, difficulty);
      reviewSuccess = true;
    } catch (error) {
      console.error("Erro ao revisar card:", error);
      alert("Erro ao salvar a revisão. Tente novamente.");
    }

    if (reviewSuccess) {
      // Move to next card
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      } else {
        // Finished studying
        setShowCompletionModal(true);
      }
    } else {
      // If review failed and it's the last card, show modal anyway
      if (currentCardIndex === cards.length - 1) {
        setShowCompletionModal(true);
      }
      // If not the last card, stay on the same card so user can try again
    }
  };

  const startStudying = () => {
    if (cards.length === 0) {
      alert("Não há cards para revisar hoje!");
      navigate('/flashcards');
      return;
    }
    setStudying(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <Header />
        <main className="main">
          <div className="columns">
            <div className="panel" style={{ width: '100%' }}>
              <div className="container">
                <p>Carregando cards para revisão...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!studying) {
    return (
      <div className="app">
        <Sidebar />
        <Header />
        <main className="main">
          <div className="columns">
            <div className="panel" style={{ width: '100%' }}>
              <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h1 style={{ margin: 0, color: 'var(--brand, #6FBE8C)', fontSize: '1.8em', fontWeight: '600' }}>
                    Estudar Flashcards
                  </h1>
                </div>

                {cards.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-content">
                      <h3>Nenhum card para revisar hoje</h3>
                      <p>Todos os seus cards estão em dia! Volte amanhã ou adicione novos cards aos seus baralhos.</p>
                      <button onClick={() => navigate('/flashcards')} style={{ padding: '1em 2em', backgroundColor: 'var(--brand, #6FBE8C)', color: 'white', border: 'none', borderRadius: '0.3em', cursor: 'pointer' }}>
                        Gerenciar Baralhos
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="study-intro">
                    <h3>Pronto para estudar?</h3>
                    <p>Você tem <strong>{cards.length}</strong> card(s) para revisar hoje.</p>
                    <div className="study-buttons">
                      <button onClick={startStudying} className="start-study-btn">
                        Começar Estudo
                      </button>
                      <button onClick={() => navigate('/flashcards')} className="back-btn">
                        Voltar aos Baralhos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <>
      <div className="app">
        <Sidebar />
        <Header />
        <main className="main">
          <div className="columns">
            <div className="panel">
              <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h1 style={{ margin: 0, color: 'var(--brand, #6FBE8C)', fontSize: '1.8em', fontWeight: '600' }}>
                    Estudando - Card {currentCardIndex + 1} de {cards.length}
                  </h1>
                  <button onClick={() => setStudying(false)} className="back-btn">
                    Parar Estudo
                  </button>
                </div>

                <div className="study-card">
                  <div className="card study-card-content">
                  <div className="question-section">
                      <h3>Pergunta:</h3>
                      <p className="question-text">{currentCard.frontText}</p>
                    </div>

                    {!showAnswer ? (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="show-answer-btn"
                      >
                        Mostrar Resposta
                      </button>
                    ) : (
                      <div className="answer-section">
                        <h3>Resposta:</h3>
                        <p className="answer-text">{currentCard.backText}</p>

                        <div className="difficulty-buttons">
                          <p>Como foi sua performance?</p>
                          <div className="buttons-row">
                            <button
                              onClick={() => handleReview('DIFICIL')}
                              className="difficulty-btn difficult"
                            >
                              DIFÍCIL
                            </button>
                            <button
                              onClick={() => handleReview('BOM')}
                              className="difficulty-btn good"
                            >
                              BOM
                            </button>
                            <button
                              onClick={() => handleReview('FACIL')}
                              className="difficulty-btn easy"
                            >
                              FÁCIL
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showCompletionModal && (
        <div className="modal-overlay" onClick={() => setShowCompletionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Parabéns! 🎉</h2>
            <p>Você terminou de revisar todos os cards pendentes.</p>
            <button onClick={() => { setShowCompletionModal(false); navigate('/flashcards'); }} className="modal-btn">
              Voltar aos Baralhos
            </button>
          </div>
        </div>
      )}
    </>
  );
}
