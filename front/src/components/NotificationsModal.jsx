import React from 'react';

export default function NotificationsModal({ open, onClose, notifications, onNavigateToHabit }) {
  if (!open) return null;

  const handleNotificationClick = (notif) => {
    onNavigateToHabit(notif.habitId, notif.listId);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Notificações de Hoje</h2>
        <p>Estas tarefas vencem hoje. Clique em uma para ir até ela!</p>
        {notifications.length === 0 ? (
          <p>Nenhuma tarefa vence hoje.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map((notif, index) => (
              <li
                key={index}
                style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}
                onClick={() => handleNotificationClick(notif)}
              >
                <strong>{notif.title}</strong>
                {notif.desc && <p>{notif.desc}</p>}
                {notif.listName && <p><em>Lista: {notif.listName}</em></p>}
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} className="btn-primary">Fechar</button>
      </div>
    </div>
  );
}
