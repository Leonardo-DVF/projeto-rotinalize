import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from "../api";
import FlashcardForm from "./FlashcardForm";
import FlashcardCard from "./FlashcardCard";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TutorialFlashcards from "../components/TutorialFlashcards";
import Chat from "../components/Chat";
import "../styles/flashcards.css";

export default function FlashcardList() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (deckId) {
      loadFlashcards();
    } else {
      setLoading(false);
    }
  }, [deckId]);

  const loadFlashcards = async () => {
    try {
      const fetchedFlashcards = await getFlashcards(deckId);
      setFlashcards(fetchedFlashcards);
    } catch (error) {
      console.error("Erro ao carregar flashcards:", error);
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (newCard) => {
    try {
      if (editing !== null) {
        // Update existing card via API
        await updateFlashcard(editing.id, {
          deckId: deckId,
          question: newCard.question,
          answer: newCard.answer,
          tag: newCard.tag
        });
        await loadFlashcards(); // Reload cards after update
        setEditing(null);
      } else {
        // Create new card via API
        await createFlashcard({
          deckId: deckId,
          question: newCard.question,
          answer: newCard.answer,
          tag: newCard.tag
        });
        await loadFlashcards(); // Reload cards after creation
      }
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar flashcard:", error);
    }
  };

  const handleDelete = async (cardId) => {
    // Remove from state immediately
    setFlashcards(prevFlashcards => prevFlashcards.filter(card => String(card.id) !== String(cardId)));
    setSuccessMessage("Cartão excluído com sucesso!");
    setTimeout(() => setSuccessMessage(""), 3000); // Clear message after 3 seconds

    try {
      await deleteFlashcard(deckId, cardId);
    } catch (error) {
      console.error("Erro ao deletar flashcard:", error);
      // If API call fails, we could revert the state change here
      // But for now, we'll just log the error
    }
  };

  const handleEdit = (card) => {
    setEditing(card);
    setShowForm(true);
  };

  return (
    <div className="app">
      <Sidebar />
      <Header />
      <main className="main">
        <div className="columns">
          <div className="panel">
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, color: 'var(--brand, #6FBE8C)', fontSize: '1.8em', fontWeight: '600' }}>
                  Gerenciar Cartões
                </h1>
                <button
                  className="info-btn"
                  title="Tutorial"
                  onClick={() => setShowTutorial(true)}
                >
                  ?
                </button>
              </div>
              {successMessage && (
                <div style={{ backgroundColor: 'var(--brand, #6FBE8C)', color: 'white', padding: '1em', borderRadius: '0.5em', marginBottom: '1em', textAlign: 'center' }}>
                  {successMessage}
                </div>
              )}

              <div className="add-flashcard-con">
                <button onClick={() => navigate('/flashcards')} style={{ marginRight: '10px' }}>Voltar aos Baralhos</button>
                <button onClick={() => navigate('/flashcards/study')} style={{ marginRight: '10px' }}>Estudar Cartões</button>
                <button onClick={() => setShowForm(true)}>Adicionar Cartão</button>
              </div>

              {loading ? (
                <p>Carregando cartões...</p>
              ) : flashcards.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-content">
                    <h3>Nenhum cartão criado ainda</h3>
                    <p>Este baralho ainda não tem cartões. Comece adicionando perguntas e respostas!</p>
                    <div className="empty-state-steps">
                      <div className="step">
                        <span className="step-number">1</span>
                        <span>Clique em "Adicionar Cartão"</span>
                      </div>
                      <div className="step">
                        <span className="step-number">2</span>
                        <span>Escreva uma pergunta no campo superior</span>
                      </div>
                      <div className="step">
                        <span className="step-number">3</span>
                        <span>Escreva a resposta no campo inferior</span>
                      </div>
                      <div className="step">
                        <span className="step-number">4</span>
                        <span>Clique em "Salvar" para adicionar o cartão</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="card-con">
                  <div className="card-list-container">
                    {flashcards.map((card) => (
                      <FlashcardCard
                        key={card.id}
                        question={card.frontText}
                        answer={card.backText}
                        onEdit={() => handleEdit(card)}
                        onDelete={() => handleDelete(card.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showForm && (
                <FlashcardForm
                  onSave={handleAdd}
                  onClose={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  initialData={editing}
                />
              )}
            </div>
          </div>

          <Chat isAuthenticated={true} type="flashcards" />
        </div>
      </main>

      {showTutorial && (
        <TutorialFlashcards onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
