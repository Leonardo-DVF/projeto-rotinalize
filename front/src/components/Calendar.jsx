import React, { useState } from 'react';
import './Calendar.css';

export default function Calendar({ activities, lists }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

  const days = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Função para verificar se um dia tem tarefas
  const getTasksForDay = (day) => {
    const dayStr = day.toISOString().split('T')[0];
    const dayOfWeek = day.getDay(); // 0 = Domingo, 1 = Segunda, etc.

    // Mapeamento do número do dia para as abreviações salvas no banco
    const dayAbbreviations = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    const currentDayAbbrev = dayAbbreviations[dayOfWeek];

    const tasks = [];

    // Verificar hábitos isolados
    activities.forEach(activity => {
      if (activity.time && activity.time.startsWith(dayStr)) {
        tasks.push({ ...activity, type: 'isolated' });
      } else if (activity.dias && activity.dias.some(d => d.toUpperCase() === currentDayAbbrev)) {
        // Para recorrentes, verificar se o dia é >= data de criação
        const createdDate = new Date(activity.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        const dayDate = new Date(day);
        dayDate.setHours(0, 0, 0, 0);
        if (dayDate >= createdDate) {
          tasks.push({ ...activity, type: 'isolated', recurring: true });
        }
      }
    });

    // Verificar hábitos em listas
    lists.forEach(list => {
      if (list.habits) {
        list.habits.forEach(habit => {
          if (habit.dueDate && habit.dueDate.startsWith(dayStr)) {
            tasks.push({ ...habit, listName: list.name, type: 'list' });
          } else if (habit.dias && habit.dias.some(d => d.toUpperCase() === currentDayAbbrev)) {
            // Para recorrentes, verificar se o dia é >= data de criação
            const createdDate = new Date(habit.createdAt);
            createdDate.setHours(0, 0, 0, 0);
            const dayDate = new Date(day);
            dayDate.setHours(0, 0, 0, 0);
            if (dayDate >= createdDate) {
              tasks.push({ ...habit, listName: list.name, type: 'list', recurring: true });
            }
          }
        });
      }
    });

    return tasks;
  };

  const handleDayClick = (day) => {
    const tasks = getTasksForDay(day);
    setSelectedDay({ day, tasks });
    setShowDayModal(true);
  };

  const closeDayModal = () => {
    setShowDayModal(false);
    setSelectedDay(null);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const openWeeklyReport = () => {
    setShowWeeklyReport(true);
  };

  const closeWeeklyReport = () => {
    setShowWeeklyReport(false);
  };

  // Função para obter os dias da semana atual (domingo a sábado)
  const getCurrentWeekDays = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={prevMonth}>‹</button>
        <h2>{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
        <button className="calendar-nav-btn" onClick={nextMonth}>›</button>
        <button className="calendar-today-btn" onClick={goToToday}>Hoje</button>
        <button className="calendar-report-btn" onClick={openWeeklyReport}>Visualização Semanal</button>
      </div>

      <div className="calendar-grid">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}

        {days.map((day, index) => {
          const tasks = getTasksForDay(day);
          const pendingTasks = tasks.filter(task => task.active !== false);
          const completedTasks = tasks.filter(task => task.active === false);
          const isCurrentMonth = day.getMonth() === month;
          const isToday = day.toDateString() === new Date().toDateString();
          const isPast = day < new Date() && !isToday;

          const hasRecurringTasks = pendingTasks.some(task => task.recurring);
          const hasOneTimeTasks = pendingTasks.some(task => !task.recurring);

          let dayClass = `calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`;

          if (pendingTasks.length > 0) {
            dayClass += ' has-tasks';
            if (hasRecurringTasks && !hasOneTimeTasks) {
              dayClass += ' recurring-only';
            } else if (!hasRecurringTasks && hasOneTimeTasks) {
              dayClass += ' onetime-only';
            } else if (hasRecurringTasks && hasOneTimeTasks) {
              dayClass += ' mixed-tasks';
            }
          }

          return (
            <div
              key={index}
              className={dayClass}
              onClick={() => handleDayClick(day)}
              style={{ cursor: tasks.length > 0 ? 'pointer' : 'default' }}
            >
              <div className="day-number">{day.getDate()}</div>
              {(pendingTasks.length > 0 || completedTasks.length > 0) && (
                <div className="day-tasks">
                  {pendingTasks.length > 0 && (
                    pendingTasks.slice(0, 3).map((task, idx) => (
                      <div key={`pending-${idx}`} className={`task-indicator ${task.recurring ? 'recurring' : ''}`}>
                        {idx === 2 && pendingTasks.length > 3 ? 'e mais...' : (task.title.length > 10 ? task.title.substring(0, 10) + '...' : task.title)}
                      </div>
                    ))
                  )}
                  {completedTasks.length > 0 && pendingTasks.length === 0 && (
                    <div className="completed-indicator">✓</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color recurring-only"></div>
          <span>Tarefas recorrentes</span>
        </div>
        <div className="legend-item">
          <div className="legend-color onetime-only"></div>
          <span>Tarefas pontuais</span>
        </div>
        <div className="legend-item">
          <div className="legend-color mixed-tasks"></div>
          <span>Misturadas</span>
        </div>
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Dia de Hoje</span>
        </div>
          <div className="legend-item">
          <span>✓ Tarefas concluídas</span>
        </div>
      </div>

      {showDayModal && selectedDay && (
        <div className="day-modal-backdrop" onClick={closeDayModal}>
          <div className="day-modal" onClick={(e) => e.stopPropagation()}>
            <div className="day-modal-header">
              <h3>{selectedDay.day.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
              <button className="day-modal-close" onClick={closeDayModal}>×</button>
            </div>
            <div className="day-modal-content">
              {selectedDay.tasks.length === 0 ? (
                <p className="no-tasks">Nenhuma tarefa para este dia.</p>
              ) : (
                <div className="tasks-list">
                  {selectedDay.tasks.map((task, idx) => (
                    <div key={idx} className={`task-item ${task.active === false ? 'completed' : ''} ${task.recurring ? 'recurring' : ''}`}>
                      <div className="task-title">
                        Título: {task.title}
                        {task.active === false && <span className="task-status"> - Concluído</span>}
                      </div>
                      <div className="task-details">
                        {task.desc && <div className="task-desc">Descrição: {task.desc}</div>}
                        {task.type === 'list' && <div className="task-list-name">Lista: {task.listName}</div>}
                        {task.dias && task.dias.length > 0 && <div className="task-repeat">Dias: {Array.isArray(task.dias) ? task.dias.join(', ') : task.dias}</div>}
                        {(!task.dias || task.dias.length === 0) && !task.recurring && <div className="task-repeat pontual">Pontual</div>}
                        {task.recurring && <div className="task-recurring-indicator">Recorrente</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showWeeklyReport && (
        <div className="day-modal-backdrop" onClick={closeWeeklyReport}>
          <div className="day-modal weekly-modal" onClick={(e) => e.stopPropagation()}>
            <div className="day-modal-header">
              <h3>Visualização Semanal</h3>
              <button className="day-modal-close" onClick={closeWeeklyReport}>×</button>
            </div>
            <div className="day-modal-content">
              <div className="weekly-report">
                {getCurrentWeekDays().map((day, idx) => {
                  const tasks = getTasksForDay(day);
                  const pendingTasks = tasks.filter(task => task.active !== false);
                  const completedTasks = tasks.filter(task => task.active === false);
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div key={idx} className={`weekly-day ${isToday ? 'today' : ''}`}>
                      <h4>{day.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}</h4>
                      {tasks.length === 0 ? (
                        <p className="no-tasks">Nenhuma tarefa</p>
                      ) : (
                        <div className="weekly-tasks">
                          {pendingTasks.length > 0 && (
                            <div className="weekly-section">
                              <h5>Pendentes ({pendingTasks.length})</h5>
                              <ul>
                                {pendingTasks.map((task, taskIdx) => (
                                  <li key={taskIdx} className={`weekly-task-item ${task.recurring ? 'recurring' : ''}`}>
                                    {task.title}
                                    {task.type === 'list' && <span className="task-list-name"> ({task.listName})</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {completedTasks.length > 0 && (
                            <div className="weekly-section">
                              <h5>Concluídas ({completedTasks.length})</h5>
                              <ul>
                                {completedTasks.map((task, taskIdx) => (
                                  <li key={taskIdx} className="weekly-task-item completed">
                                    {task.title}
                                    {task.type === 'list' && <span className="task-list-name"> ({task.listName})</span>}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
