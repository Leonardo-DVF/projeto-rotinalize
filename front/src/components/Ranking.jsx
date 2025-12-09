import React, { useEffect, useState } from 'react';
import { getHabits } from '../api.js';

const rankLevels = [
  { name: 'Diamante', min: 220, color: '#2196F3', emoji: '🔵' },
  { name: 'Ouro', min: 111, color: '#FFEB3B', emoji: '🟡' },
  { name: 'Prata', min: 31, color: '#C0C0C0', emoji: '⚪' },
  { name: 'Bronze', min: 0, color: '#A0522D', emoji: '🟫' }
];

function getUserRank(totalCompleted) {
  for (const level of rankLevels) {
    if (totalCompleted >= level.min) {
      return level;
    }
  }
  return rankLevels[rankLevels.length - 1];
}

export default function Ranking() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(rankLevels[3]);

  useEffect(() => {
    async function fetchHabits() {
      try {
        const habitsData = await getHabits();
        setHabits(habitsData || []);
      } catch (err) {
        console.error('Erro ao carregar hábitos para ranking:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHabits();
  }, []);

  useEffect(() => {
    if (!loading && habits.length > 0) {
      const completedCount = habits.filter(h => h.active === false).length;
      const rank = getUserRank(completedCount);
      setUserRank(rank);

      try {
        localStorage.setItem('userRank', rank.name);
      } catch {}
    }
  }, [loading, habits]);

  if (loading) {
    return <div className="ranking-card" style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#12473f', color: '#e5f5ee' }}>Carregando ranking...</div>;
  }

  const displayedCompletedCount = habits.filter(h => h.active === false).length;

  return (
    <div className="ranking-card" style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#12473f', color: '#e5f5ee' }}>
      <h3 style={{ color: '#e5f5ee', marginBottom: '0.5rem' }}>Seu Ranking</h3>
      <p style={{ marginBottom: '0.5rem' }}>Total de tarefas concluídas: {displayedCompletedCount}</p>
      <h2 style={{ color: userRank.color }}>
        {userRank.emoji} {userRank.name}
      </h2>
    </div>
  );
}
