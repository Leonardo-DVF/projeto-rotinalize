const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => null)
    const errMsg = text || `${res.status} ${res.statusText}`
    throw new Error(errMsg)
  }
  if (res.status === 204) return null
    return await res.json()
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/* ============================================================
   🟩 HÁBITOS (To-dos e hábitos individuais)
============================================================ */

// Buscar todos os hábitos
export async function getHabits() {
  const res = await fetch(`${API_BASE}/habits`, {
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Criar novo hábito
export async function createHabit(habit) {
  const userId = localStorage.getItem('userId');
  const res = await fetch(`${API_BASE}/habits`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: habit.title,
      description: habit.description,
      dias: habit.dias,
      dueDate: habit.dueDate,
      listId: habit.listId,
      userId: habit.listId ? null : userId,
    }),
  })
  return handleResponse(res)
}

// Atualizar hábito
export async function updateHabit(id, data) {
  const res = await fetch(`${API_BASE}/habits/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

// Deletar hábito
export async function deleteHabit(id) {
  const res = await fetch(`${API_BASE}/habits/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// 🤖 Enviar mensagem para a IA
export async function sendMessageToAI(message, type = 'faq') {
  try {
    let url;
    if (type === 'flashcards') {
      url = `/chat/flashcards?mensagem=${encodeURIComponent(message)}`;
    } else {
      url = `/chat/faq?mensagem=${encodeURIComponent(message)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erro da API: ${response.status}`);
    }

    if (type === 'flashcards') {
      const json = await response.json();
      return json; // Return the JSON object directly
    } else {
      const text = await response.text();
      return text || 'A IA não retornou uma resposta.';
    }
  } catch (error) {
    throw error;
  }
}

/* ============================================================
   👤 USUÁRIOS
============================================================ */

// Registrar novo usuário
export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userData.name.trim(),
      email: userData.email.trim(),
      password: userData.password,
    }),
  })
  return handleResponse(res)
}

// Listar usuários
export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`, {
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Login do usuário
export async function loginUser(credentials) {
  // Primeiro, fazer uma requisição para autenticar via HTTP Basic Auth
  const res = await fetch(`${API_BASE}/users/authenticate`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`${credentials.name.trim()}:${credentials.password}`),
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error('Credenciais inválidas');
  }

  const token = await res.text(); // JWT is returned as plain text, not JSON
  localStorage.setItem('token', token);
  localStorage.setItem('userName', credentials.name.trim());

  // Sempre buscar o usuário após login para obter o UUID correto
  try {
    const users = await getUsers();
    const user = users.find(u => u.name === credentials.name.trim());
    if (user && user.id) {
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
    } else {
      throw new Error('User not found after login');
    }
  } catch (e) {
    console.error('Failed to get userId after login:', e);
    // Tentar decode do JWT como último recurso
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.id || payload.userId || payload.sub;
      if (userId && typeof userId === 'string' && userId.length === 36) {
        localStorage.setItem('userId', user.id);
      } else {
        throw new Error('Invalid userId from JWT');
      }
    } catch (jwtError) {
      console.error('JWT decode also failed:', jwtError);
      throw new Error('Não foi possível obter o ID do usuário. Tente novamente.');
    }
  }
  return token;
}

/* ============================================================
   📋 LISTAS DE HÁBITOS
============================================================ */

// Buscar todas as listas
export async function getLists() {
  const res = await fetch(`${API_BASE}/lists`, {
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Buscar uma lista específica (com seus hábitos)
export async function getList(id) {
  const res = await fetch(`${API_BASE}/lists/${id}`, {
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Criar nova lista
export async function createList(data) {
  const userId = localStorage.getItem('userId');
  const res = await fetch(`${API_BASE}/lists`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      name: data.name,
      description: data.description || null,
      userId: userId,
    }),
  })
  return handleResponse(res)
}

// Deletar lista
export async function deleteList(id) {
  const res = await fetch(`${API_BASE}/lists/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Buscar hábitos dentro de uma lista
export async function getHabitsByList(listId) {
  const res = await fetch(`${API_BASE}/lists/${listId}/habits`, {
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Criar hábito dentro de uma lista
export async function createHabitInList(data) {
  const userId = localStorage.getItem('userId');
  const res = await fetch(`${API_BASE}/habits`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      dias: data.dias,
      dueDate: data.dueDate,
      listId: data.listId,
      userId: data.listId ? null : userId,
    }),
  })
  return handleResponse(res)
}

/* ============================================================
   📚 FLASHCARD DECKS
============================================================ */

// Buscar todos os decks do usuário
export async function getDecks() {
  const res = await fetch(`${API_BASE}/decks`, {
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Criar novo deck
export async function createDeck(deck) {
  const res = await fetch(`${API_BASE}/decks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      title: deck.title,
      description: deck.description,
    }),
  })
  return handleResponse(res)
}

// Atualizar deck
export async function updateDeck(id, data) {
  const res = await fetch(`${API_BASE}/decks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res)
}

// Deletar deck
export async function deleteDeck(id) {
  const res = await fetch(`${API_BASE}/decks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

/* ============================================================
   🃏 FLASHCARDS
============================================================ */

// Buscar flashcards de um deck
export async function getFlashcards(deckId) {
  const res = await fetch(`${API_BASE}/flashcards/deck/${deckId}`, {
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Criar novo flashcard
export async function createFlashcard(flashcard) {
  const res = await fetch(`${API_BASE}/flashcards`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      deckId: flashcard.deckId,
      frontText: flashcard.question,
      backText: flashcard.answer,
      tag: flashcard.tag,
    }),
  })
  return handleResponse(res)
}

// Atualizar flashcard
export async function updateFlashcard(id, data) {
  const res = await fetch(`${API_BASE}/flashcards/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      deckId: data.deckId,
      frontText: data.question,
      backText: data.answer,
      tag: data.tag,
    }),
  })
  return handleResponse(res)
}

// Deletar flashcard
export async function deleteFlashcard(deckId, cardId) {
  const res = await fetch(`${API_BASE}/flashcards/${deckId}/${cardId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Revisar flashcard
export async function reviewFlashcard(cardId, rating) {
  const res = await fetch(`${API_BASE}/flashcards/${cardId}/review?rating=${rating}`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}

// Buscar cards para revisar hoje
export async function getCardsToReviewToday() {
  const res = await fetch(`${API_BASE}/flashcards/review-today`, {
    headers: getAuthHeaders()
  })
  return handleResponse(res)
}
