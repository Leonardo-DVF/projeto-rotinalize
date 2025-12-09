import React, { useState, useEffect } from "react";
import { getDecks, createDeck, deleteDeck, updateDeck } from "../api";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TutorialFlashcards from "../components/TutorialFlashcards";
import Chat from "../components/Chat";
import "../styles/flashcards.css";

export default function FlashcardDeckList() {
  const [decks, setDecks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const fetchedDecks = await getDecks();
      setDecks(fetchedDecks);
    } catch (error) {
      console.error("Erro ao carregar decks:", error);
      setDecks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      if (editing) {
        // Update existing deck via API
        await updateDeck(editing.id, { title, description });
        await loadDecks(); // Reload decks after update
      } else {
        // Create new deck via API
        await createDeck({ title, description });
        await loadDecks(); // Reload decks after creation
      }
      setShowForm(false);
      setEditing(null);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Erro ao salvar deck:", error);
    }
  };

  const handleEdit = (deck) => {
    setEditing(deck);
    setTitle(deck.title);
    setDescription(deck.description || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    // Remove from state immediately
    setDecks(prevDecks => prevDecks.filter(deck => String(deck.id) !== String(id)));
    setSuccessMessage("Baralho excluído com sucesso!");
    setTimeout(() => setSuccessMessage(""), 3000); // Clear message after 3 seconds

    try {
      await deleteDeck(id);
    } catch (error) {
      console.error("Erro ao deletar deck:", error);
      // If API call fails, we could revert the state change here
      // But for now, we'll just log the error
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditing(null);
    setTitle("");
    setDescription("");
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
                  Gerenciar Baralhos
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
                <button onClick={() => setShowForm(true)}>Criar Novo Baralho</button>
              </div>

              {loading ? (
                <p>Carregando baralhos...</p>
              ) : decks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-content">
                    <h3>Nenhum baralho criado ainda</h3>
                    <p>Crie seu primeiro baralho de flashcards para começar a estudar!</p>
                    <div className="empty-state-steps">
                      <div className="step">
                        <span className="step-number">1</span>
                        <span>Clique em "Criar Novo Baralho"</span>
                      </div>
                      <div className="step">
                        <span className="step-number">2</span>
                        <span>Dê um nome e descrição ao seu baralho</span>
                      </div>
                      <div className="step">
                        <span className="step-number">3</span>
                        <span>Adicione cartões com perguntas e respostas</span>
                      </div>
                      <div className="step">
                        <span className="step-number">4</span>
                        <span>Comece a estudar!</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="deck-list">
                  {decks.map(deck => (
                    <div key={deck.id} className="deck-card" onClick={() => window.location.href = `/flashcards/deck/${deck.id}`}>
                      <h3>{deck.title}</h3>
                      <p>{deck.description || "Sem descrição"}</p>
                      <div className="deck-actions">
                        <button onClick={(e) => { e.stopPropagation(); window.location.href = `/flashcards/deck/${deck.id}`; }}>Ver Cartões</button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(deck); }}>Editar</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(deck.id); }}>Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showForm && (
                <div className="question-container">
                  <h2>{editing ? "Editar Baralho" : "Criar Baralho"}</h2>
                  <label className="title-label">Título:</label>
                  <input
                    type="text"
                    className="input title-input"
                    placeholder="Título do baralho..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <label>Descrição:</label>
                  <textarea
                    className="input"
                    placeholder="Descrição do baralho..."
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1em' }}>
                    <button onClick={handleClose} style={{ backgroundColor: 'var(--danger, #e74c3c)', color: 'white', padding: '0.8em 2em', borderRadius: '0.3em', fontWeight: '600', border: 'none', cursor: 'pointer', marginRight: '1em' }}>
                      Cancelar
                    </button>
                    <button onClick={handleSubmit} style={{ padding: '0.8em 2em' }}>
                      {editing ? "Atualizar" : "Criar"}
                    </button>
                  </div>
                </div>
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
