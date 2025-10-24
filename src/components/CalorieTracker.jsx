import { useEffect, useMemo, useState } from "react";
import { DEFAULT_TARGETS } from "../constants/defaultTargets.js";
import { toISODate } from "../utils/date.js";

function CalorieTracker({ calorieData, onDeleteEntry, calorieGoal, onUpdateGoal }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(calorieGoal ?? DEFAULT_TARGETS.calorieDailyGoal);
  const canEditGoal = Boolean(onUpdateGoal);

  useEffect(() => {
    setGoalInput(calorieGoal ?? DEFAULT_TARGETS.calorieDailyGoal);
  }, [calorieGoal]);

  const todayEntries = useMemo(
    () =>
      calorieData.filter(
        (entry) => toISODate(entry.date ?? entry.timestamp) === selectedDate
      ),
    [calorieData, selectedDate]
  );

  const totalCalories = todayEntries.reduce((sum, entry) => sum + entry.calories, 0);
  const dailyGoal = Math.max(1, Number(calorieGoal ?? DEFAULT_TARGETS.calorieDailyGoal));
  const remaining = dailyGoal - totalCalories;
  const percentage = Math.min(Math.max((totalCalories / dailyGoal) * 100, 0), 100);

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { id: 'lunch', label: 'Lunch', emoji: '🌞' },
    { id: 'dinner', label: 'Dinner', emoji: '🌙' },
    { id: 'snacks', label: 'Snacks', emoji: '🍿' }
  ];

  // Group entries by meal type in one pass
  const mealsByType = useMemo(() => {
    const grouped = {};
    mealTypes.forEach(meal => {
      grouped[meal.id] = { entries: [], total: 0 };
    });

    todayEntries.forEach(entry => {
      const mealType = entry.mealType;
      if (grouped[mealType]) {
        grouped[mealType].entries.push(entry);
        grouped[mealType].total += entry.calories;
      }
    });

    return grouped;
  }, [todayEntries]);

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
        {canEditGoal && (
          <div className="target-actions">
            {editingGoal ? (
              <div className="target-editor">
                <input
                  type="number"
                  min={500}
                  step={10}
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                />
                <button
                  type="button"
                  className="pill-button"
                  onClick={async () => {
                    if (onUpdateGoal) {
                      await onUpdateGoal(Number(goalInput));
                    }
                    setEditingGoal(false);
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="pill-button pill-button--outline"
                  onClick={() => {
                    setEditingGoal(false);
                    setGoalInput(calorieGoal ?? DEFAULT_TARGETS.calorieDailyGoal);
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="target-edit-btn"
                onClick={() => setEditingGoal(true)}
              >
                Set daily goal
              </button>
            )}
          </div>
        )}
      </div>

      <div className="meals-grid">
        {mealTypes.map((meal) => {
          const { entries, total } = mealsByType[meal.id] || { entries: [], total: 0 };

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
