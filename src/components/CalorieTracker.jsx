import { useState } from "react";

function CalorieTracker({ calorieData, onDeleteEntry }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const todayEntries = calorieData.filter(entry => entry.date === selectedDate);

  const totalCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const dailyGoal = 2200;
  const remaining = dailyGoal - totalCalories;
  const percentage = Math.min((totalCalories / dailyGoal) * 100, 100);

  const getMealEntries = (mealType) => {
    return todayEntries.filter(entry => entry.mealType === mealType);
  };

  const getMealTotal = (mealType) => {
    return getMealEntries(mealType).reduce((sum, entry) => sum + entry.calories, 0);
  };

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { id: 'lunch', label: 'Lunch', emoji: '🌞' },
    { id: 'dinner', label: 'Dinner', emoji: '🌙' },
    { id: 'snacks', label: 'Snacks', emoji: '🍿' }
  ];

  return (
    <div className="calorie-tracker">
      <div className="calorie-header">
        <h2 className="section-title">Calorie Tracker</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
      </div>

      <div className="calorie-summary-card">
        <div className="calorie-stats">
          <div className="calorie-stat">
            <span className="stat-label">Daily Goal</span>
            <span className="stat-value goal">{dailyGoal}</span>
          </div>
          <div className="calorie-stat">
            <span className="stat-label">Consumed</span>
            <span className="stat-value consumed">{totalCalories}</span>
          </div>
          <div className="calorie-stat">
            <span className="stat-label">Remaining</span>
            <span className={`stat-value ${remaining >= 0 ? 'remaining' : 'exceeded'}`}>
              {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
            </span>
          </div>
        </div>

        <div className="calorie-progress-bar">
          <div
            className="calorie-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="progress-text">{Math.round(percentage)}% of daily goal</p>
      </div>

      <div className="meals-grid">
        {mealTypes.map((meal) => {
          const entries = getMealEntries(meal.id);
          const total = getMealTotal(meal.id);

          return (
            <div key={meal.id} className="meal-card">
              <div className="meal-header">
                <h3>
                  <span className="meal-emoji">{meal.emoji}</span>
                  {meal.label}
                </h3>
                <span className="meal-total">{total} cal</span>
              </div>

              {entries.length > 0 ? (
                <ul className="meal-entries">
                  {entries.map((entry) => (
                    <li key={entry.id} className="meal-entry">
                      <div className="entry-info">
                        <span className="entry-name">{entry.foodName}</span>
                        {entry.portion && (
                          <span className="entry-portion">{entry.portion}</span>
                        )}
                      </div>
                      <div className="entry-actions">
                        <span className="entry-calories">{entry.calories}</span>
                        <button
                          type="button"
                          className="delete-entry"
                          onClick={() => onDeleteEntry(entry.id)}
                          aria-label="Delete entry"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-meal">No items logged</p>
              )}
            </div>
          );
        })}
      </div>

      {todayEntries.length === 0 && (
        <div className="empty-state">
          <p>No calories logged for this day yet.</p>
          <p>Use Quick Add → Calories to start tracking!</p>
        </div>
      )}
    </div>
  );
}

export default CalorieTracker;
