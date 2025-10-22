import { useState } from "react";

function StreakCalendar({ fitnessLogs, calorieData, expenseData, todoData, attendanceData }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayDetails, setShowDayDetails] = useState(false);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getDateStr = (day) => {
    const { year, month } = getDaysInMonth(currentMonth);
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getActivityForDay = (day) => {
    const dateStr = getDateStr(day);

    // Check fitness
    const fitnessData = fitnessLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.toISOString().split('T')[0] === dateStr;
    });

    // Check calories
    const caloriesData = calorieData.filter(entry => entry.date === dateStr);

    // Check expenses
    const expensesData = expenseData.filter(entry => entry.date === dateStr);

    // Check attendance
    const hasAttendance = attendanceData.dates.includes(dateStr);
    const attendanceNotes = hasAttendance ? attendanceData.notes[dateStr] : null;

    // Check todos
    const todosData = todoData.filter(todo =>
      new Date(todo.createdAt).toISOString().split('T')[0] === dateStr
    );

    return {
      dateStr,
      hasFitness: fitnessData.length > 0,
      hasCalories: caloriesData.length > 0,
      hasExpenses: expensesData.length > 0,
      hasAttendance,
      fitnessData,
      caloriesData,
      expensesData,
      attendanceNotes,
      todosData,
      activityCount: [fitnessData.length > 0, caloriesData.length > 0, expensesData.length > 0, hasAttendance].filter(Boolean).length
    };
  };

  const handleDayClick = (day) => {
    const activity = getActivityForDay(day);
    setSelectedDay({ day, ...activity });
    setShowDayDetails(true);
  };

  const getActivityClass = (activityCount) => {
    if (activityCount === 0) return 'activity-none';
    if (activityCount === 1) return 'activity-low';
    if (activityCount === 2) return 'activity-medium';
    if (activityCount === 3) return 'activity-high';
    return 'activity-max';
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  // Calculate current streaks
  const getCurrentStreaks = () => {
    const today = new Date().toISOString().split('T')[0];
    let fitnessStreak = 0;
    let attendanceStreak = 0;

    // Fitness streak
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasActivity = fitnessLogs.some(log => {
        const logDate = new Date(log.date);
        return logDate.toISOString().split('T')[0] === dateStr;
      });
      if (hasActivity) {
        fitnessStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Attendance streak
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (attendanceData.dates.includes(dateStr)) {
        attendanceStreak++;
      } else if (i > 0 && date.getDay() !== 0 && date.getDay() !== 6) {
        break;
      }
    }

    return { fitnessStreak, attendanceStreak };
  };

  const streaks = getCurrentStreaks();

  return (
    <div className="streak-calendar-section">
      <div className="streak-header">
        <div>
          <h3 className="streak-title">Activity Streak Calendar</h3>
          <p className="streak-subtitle">Track your daily activities at a glance</p>
        </div>
        <div className="current-streaks">
          <div className="streak-badge">
            <span className="streak-emoji">💪</span>
            <div className="streak-info">
              <span className="streak-count">{streaks.fitnessStreak}</span>
              <span className="streak-label">Fitness</span>
            </div>
          </div>
          <div className="streak-badge">
            <span className="streak-emoji">🦋</span>
            <div className="streak-info">
              <span className="streak-count">{streaks.attendanceStreak}</span>
              <span className="streak-label">Office</span>
            </div>
          </div>
        </div>
      </div>

      <div className="streak-calendar">
        <div className="calendar-header">
          <button type="button" onClick={previousMonth} className="calendar-nav">‹</button>
          <h4 className="calendar-month">{monthName} {year}</h4>
          <button type="button" onClick={nextMonth} className="calendar-nav">›</button>
        </div>

        <div className="calendar-weekdays">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="calendar-weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {blanks.map((blank) => (
            <div key={`blank-${blank}`} className="calendar-day blank"></div>
          ))}
          {days.map((day) => {
            const activity = getActivityForDay(day);
            return (
              <div
                key={day}
                className={`streak-day ${getActivityClass(activity.activityCount)}`}
                title={`${activity.activityCount} activities on ${monthName} ${day}`}
                onClick={() => handleDayClick(day)}
              >
                <span className="day-number">{day}</span>
                <div className="activity-indicators">
                  {activity.hasFitness && <span className="activity-dot fitness">💪</span>}
                  {activity.hasCalories && <span className="activity-dot calories">🍽️</span>}
                  {activity.hasExpenses && <span className="activity-dot expenses">💰</span>}
                  {activity.hasAttendance && <span className="activity-dot attendance">🦋</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span className="legend-title">Activity Level:</span>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-box legend-box--none" />
              <span>None</span>
            </div>
            <div className="legend-item">
              <div className="legend-box legend-box--low" />
              <span>Low</span>
            </div>
            <div className="legend-item">
              <div className="legend-box legend-box--medium" />
              <span>Medium</span>
            </div>
            <div className="legend-item">
              <div className="legend-box legend-box--high" />
              <span>High</span>
            </div>
            <div className="legend-item">
              <div className="legend-box legend-box--max" />
              <span>Max</span>
            </div>
          </div>
        </div>
      </div>

      <div className="activity-stats">
        <div className="stat-item">
          <span className="stat-icon">💪</span>
          <span className="stat-label">Fitness</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🍽️</span>
          <span className="stat-label">Calories</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💰</span>
          <span className="stat-label">Expenses</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🦋</span>
          <span className="stat-label">Attendance</span>
        </div>
      </div>

      {showDayDetails && selectedDay && (
        <div className="day-details-modal" onClick={() => setShowDayDetails(false)}>
          <div className="day-details-content" onClick={(e) => e.stopPropagation()}>
            <div className="day-details-header">
              <h3>📅 {monthName} {selectedDay.day}, {year}</h3>
              <button className="close-modal-btn" onClick={() => setShowDayDetails(false)}>×</button>
            </div>

            <div className="day-details-body">
              {selectedDay.activityCount === 0 ? (
                <p className="no-activity">No activities recorded for this day</p>
              ) : (
                <>
                  {/* Fitness Activities */}
                  {selectedDay.hasFitness && (
                    <div className="activity-section">
                      <h4 className="activity-section-title">💪 Fitness</h4>
                      {selectedDay.fitnessData.map((log, idx) => (
                        <div key={idx} className="activity-detail-card">
                          <div className="activity-time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                          <div className="exercise-list">
                            {log.exercises.map((ex, i) => (
                              <div key={i} className="exercise-item">
                                <span className="exercise-bullet">•</span>
                                <span className={ex.completed ? "completed" : ""}>{ex.text}</span>
                              </div>
                            ))}
                          </div>
                          {log.notes && <div className="activity-notes">📝 {log.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Calories */}
                  {selectedDay.hasCalories && (
                    <div className="activity-section">
                      <h4 className="activity-section-title">🍽️ Calories</h4>
                      {selectedDay.caloriesData.reduce((acc, entry) => {
                        if (!acc[entry.mealType]) acc[entry.mealType] = [];
                        acc[entry.mealType].push(entry);
                        return acc;
                      }, {}) && Object.entries(selectedDay.caloriesData.reduce((acc, entry) => {
                        if (!acc[entry.mealType]) acc[entry.mealType] = [];
                        acc[entry.mealType].push(entry);
                        return acc;
                      }, {})).map(([mealType, entries]) => (
                        <div key={mealType} className="meal-group">
                          <div className="meal-type-header">
                            {mealType === 'breakfast' && '🌅 Breakfast'}
                            {mealType === 'lunch' && '🌞 Lunch'}
                            {mealType === 'dinner' && '🌙 Dinner'}
                            {mealType === 'snacks' && '🍿 Snacks'}
                          </div>
                          {entries.map((entry, idx) => (
                            <div key={idx} className="calorie-entry">
                              <span className="food-name">{entry.foodName}</span>
                              <span className="food-portion">{entry.portion}</span>
                              <span className="food-calories">{entry.calories} cal</span>
                            </div>
                          ))}
                        </div>
                      ))}
                      <div className="total-calories">
                        Total: {selectedDay.caloriesData.reduce((sum, entry) => sum + entry.calories, 0)} calories
                      </div>
                    </div>
                  )}

                  {/* Expenses */}
                  {selectedDay.hasExpenses && (
                    <div className="activity-section">
                      <h4 className="activity-section-title">💰 Expenses</h4>
                      {selectedDay.expensesData.map((expense, idx) => (
                        <div key={idx} className="expense-entry">
                          <div className="expense-header">
                            <span className="expense-category">
                              {expense.category === 'food' && '🍔 Food'}
                              {expense.category === 'transport' && '🚗 Transport'}
                              {expense.category === 'shopping' && '🛍️ Shopping'}
                              {expense.category === 'entertainment' && '🎬 Entertainment'}
                              {expense.category === 'bills' && '📱 Bills'}
                              {expense.category === 'health' && '💊 Health'}
                              {expense.category === 'other' && '📌 Other'}
                            </span>
                            <span className="expense-amount">₹{expense.amount}</span>
                          </div>
                          {expense.description && <div className="expense-description">{expense.description}</div>}
                        </div>
                      ))}
                      <div className="total-expenses">
                        Total: ₹{selectedDay.expensesData.reduce((sum, exp) => sum + exp.amount, 0)}
                      </div>
                    </div>
                  )}

                  {/* Attendance */}
                  {selectedDay.hasAttendance && (
                    <div className="activity-section">
                      <h4 className="activity-section-title">🦋 Office Attendance</h4>
                      <div className="attendance-info">
                        <div className="attendance-badge">✓ Attended Office</div>
                        {selectedDay.attendanceNotes && (
                          <div className="attendance-notes">
                            <strong>Notes:</strong> {selectedDay.attendanceNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Todos */}
                  {selectedDay.todosData.length > 0 && (
                    <div className="activity-section">
                      <h4 className="activity-section-title">✅ Tasks</h4>
                      <div className="todos-summary">
                        {selectedDay.todosData.map((todo, idx) => (
                          <div key={idx} className="todo-item-detail">
                            <span className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}>
                              {todo.completed ? '✓' : '○'}
                            </span>
                            <div className="todo-content">
                              <div className="todo-title">{todo.title}</div>
                              <div className="todo-meta">
                                <span className={`priority-badge ${todo.priority}`}>
                                  {todo.priority === 'high' && '🔴 High'}
                                  {todo.priority === 'medium' && '🟡 Medium'}
                                  {todo.priority === 'low' && '🟢 Low'}
                                </span>
                                <span className="category-badge">{todo.category}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="todos-completed-count">
                          {selectedDay.todosData.filter(t => t.completed).length} / {selectedDay.todosData.length} completed
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StreakCalendar;
