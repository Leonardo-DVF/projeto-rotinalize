// src/components/HabitList.jsx
import React from "react";
import ListCard from "./ListCard.jsx";

export default function HabitList({ lists = [], expandedLists, setExpandedLists, selectedId, onOpen, onEdit, onDelete, onAddHabit, onHabitClick, onHabitComplete, onHabitCompleteIndividual, onCompleteList, onOptions, isAuthenticated }) {
  if (!isAuthenticated) {
    return (
      <div style={{ opacity: 0.7, textAlign: 'center', padding: '20px' }}>
        <h4>Para criar listas, você precisa estar logado.</h4>
        <p><a href="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>Faça login aqui</a> ou <a href="/cadastro" style={{ color: '#007bff', textDecoration: 'underline' }}>cadastre-se</a>.</p>
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <div style={{ opacity: 0.7, textAlign: 'center', padding: '20px' }}>
        <p>Você ainda não criou nenhuma lista.</p>
        <p>Clique no botão "+" acima para adicionar suas listas!</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {lists.map(list => (
        <ListCard
          key={list.id}
          list={list}
          selected={selectedId === list.id}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddHabit={onAddHabit}
          onHabitClick={onHabitClick}
          onHabitComplete={onHabitComplete}
          onHabitCompleteIndividual={onHabitCompleteIndividual}
          onCompleteList={onCompleteList}
          onOptions={onOptions}
          expandedLists={expandedLists}
          setExpandedLists={setExpandedLists}
        />
      ))}

    </div>
  );
}
