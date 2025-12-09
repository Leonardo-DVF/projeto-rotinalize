import React, { useState, useEffect, useRef } from 'react'
import { sendMessageToAI } from '../api.js'

export default function Chat({ isAuthenticated, type = 'faq' }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  // 🔹 Referência para o final da lista de mensagens
  const messagesEndRef = useRef(null)

  // 🔹 Carrega mensagens do localStorage ao montar o componente
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const key = userId ? `chat-messages-${type}-${userId}` : `chat-messages-${type}`
    const savedMessages = localStorage.getItem(key)
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    } else if (isAuthenticated) {
      const welcomeMessage = {
        sender: 'ai',
        text: type === 'flashcards'
          ? 'OI eu sou a IAlize e posso te ajudar com:\n\n• Planejamento de baralhos\n\n• Criação de flash cards'
          : 'OI eu sou a IAlize e posso te ajudar com:\n\n• Planejamento de estudos\n\n• Resumos\n\n• Gerar exercícios para reforçar seus estudos'
      }
      setMessages([welcomeMessage])
    }
  }, [isAuthenticated, type])

  // 🔹 Salva mensagens no localStorage sempre que elas mudam
  useEffect(() => {
    if (messages.length > 0) {
      const userId = localStorage.getItem('userId')
      const key = userId ? `chat-messages-${type}-${userId}` : `chat-messages-${type}`
      localStorage.setItem(key, JSON.stringify(messages))
    }
  }, [messages, type])

  // 🔹 Faz o scroll automático para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages]) // Executa sempre que novas mensagens aparecem

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMsg = { sender: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const aiResponse = await sendMessageToAI(trimmed, type)
      let aiMsg;
      if (type === 'flashcards' && aiResponse.cards) {
        // Format flashcards response
        const cardsText = aiResponse.cards.map((card, index) =>
          `**Flashcard ${index + 1}:**\nPergunta: ${card.front}\nResposta: ${card.back}${card.hint ? `\nDica: ${card.hint}` : ''}${card.tags ? `\nTags: ${card.tags.join(', ')}` : ''}`
        ).join('\n\n');
        aiMsg = { sender: 'ai', text: `Aqui estão os flashcards gerados:\n\n${cardsText}` }
      } else {
        aiMsg = { sender: 'ai', text: aiResponse }
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      console.error('Erro no chat:', err)
      const errorMsg = err.message.includes('404') ?
        'A funcionalidade de IA não está disponível no momento.' :
        err.message.includes('500') ?
        'Erro interno do servidor. Tente novamente mais tarde.' :
        'Erro ao comunicar com a IA. Verifique a conexão.'
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: errorMsg },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') handleSend()
  }

  function handleClearChat() {
    const welcomeMessage = {
      sender: 'ai',
      text: type === 'flashcards'
        ? 'OI eu sou a IAlize e posso te ajudar com:\n\n• Planejamento de baralhos\n\n• Criação de flash cards'
        : 'OI eu sou a IAlize e posso te ajudar com:\n\n• Planejamento de estudos\n\n• Resumos\n\n• Gerar exercícios para reforçar seus estudos'
    }
    setMessages([welcomeMessage])
    localStorage.removeItem(`chat-messages-${type}`)
  }

  return (
    <section className="panel chat-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="chat-title">{type === 'flashcards' ? 'Gerar Flashcards' : 'IAlize'}</h3>
        {isAuthenticated && messages.length > 1 && (
          <button onClick={handleClearChat} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.5em 1em', borderRadius: '0.3em', cursor: 'pointer' }}>
            Limpar Chat
          </button>
        )}
      </div>

      <div className="chat-box">
        {!isAuthenticated && (
          <div className="chat-placeholder" style={{ color: '#727272ff', textAlign: 'center', padding: '20px' }}>
            <h4>Para conversar com a IA, você precisa estar logado.</h4>
            <p><a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>Faça login aqui</a> ou <a href="/cadastro" style={{ color: '#007bff', textDecoration: 'underline' }}>cadastre-se</a>.</p>
          </div>
        )}
        {isAuthenticated && messages.length === 1 && messages[0].sender === 'ai' && (
          <div className="chat-placeholder">Inicie uma conversa com a IA.</div>
        )}

        {isAuthenticated && messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.sender}`}>
            <b>{m.sender === 'user' ? 'Você:' : 'IAlize:'}</b> {m.text}
          </div>
        ))}

        {isAuthenticated && loading && <div className="chat-loading">A IA está pensando...</div>}

        {/* 🔹 Elemento invisível que serve de âncora para o scroll automático */}
        <div ref={messagesEndRef} />
      </div>

      {isAuthenticated && (
        <div className="chat-input-area">
          <input
            type="text"
            placeholder={type === 'flashcards' ? "Descreva o tema para gerar flashcards..." : "Digite sua mensagem..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSend} disabled={loading}>
            Enviar
          </button>
        </div>
      )}
    </section>
  )
}
