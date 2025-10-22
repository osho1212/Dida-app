import { useState } from "react";

const tabs = [
  { id: "fitness", label: "Fitness" },
  { id: "calories", label: "Calories" },
  { id: "expenses", label: "Expenses" },
  { id: "attendance", label: "Attendance" },
  { id: "todos", label: "To-Dos" }
];

function QuickAddModal({ onClose, onSaveFitness, onSaveAttendance, onSaveCalorie, onSaveExpense, onSaveTodo }) {
  const [activeTab, setActiveTab] = useState("fitness");
  const [exercises, setExercises] = useState([
    { id: 1, name: "Morning Run", completed: false },
    { id: 2, name: "Strength Training", completed: false },
    { id: 3, name: "Stretching", completed: false }
  ]);
  const [newExercise, setNewExercise] = useState("");
  const [fitnessNotes, setFitnessNotes] = useState("");
  const [attendedOffice, setAttendedOffice] = useState(false);
  const [attendanceNotes, setAttendanceNotes] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [calorieDate, setCalorieDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [portion, setPortion] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("food");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDescription, setTodoDescription] = useState("");
  const [todoCategory, setTodoCategory] = useState("work");
  const [todoPriority, setTodoPriority] = useState("medium");
  const [todoDueDate, setTodoDueDate] = useState("");

  const toggleExercise = (id) => {
    setExercises(exercises.map(ex =>
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
  };

  const addExercise = () => {
    if (newExercise.trim()) {
      setExercises([...exercises, {
        id: Date.now(),
        name: newExercise,
        completed: false
      }]);
      setNewExercise("");
    }
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSave = () => {
    if (activeTab === "fitness" && onSaveFitness) {
      const now = new Date();
      const log = {
        id: Date.now(),
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        exercises: exercises,
        notes: fitnessNotes.trim()
      };
      onSaveFitness(log);
    } else if (activeTab === "attendance" && onSaveAttendance && attendedOffice) {
      onSaveAttendance(attendanceDate, attendanceNotes);
    } else if (activeTab === "calories" && onSaveCalorie) {
      if (foodName.trim() && calories && parseInt(calories) > 0) {
        const entry = {
          id: Date.now(),
          date: calorieDate,
          foodName: foodName.trim(),
          calories: parseInt(calories),
          portion: portion.trim(),
          mealType: mealType,
          timestamp: new Date().toISOString()
        };
        onSaveCalorie(entry);
      }
    } else if (activeTab === "expenses" && onSaveExpense) {
      if (expenseDescription.trim() && expenseAmount && parseFloat(expenseAmount) > 0) {
        const entry = {
          id: Date.now(),
          date: expenseDate,
          description: expenseDescription.trim(),
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
          notes: expenseNotes.trim(),
          timestamp: new Date().toISOString()
        };
        onSaveExpense(entry);
      }
    } else if (activeTab === "todos" && onSaveTodo) {
      if (todoTitle.trim()) {
        const entry = {
          id: Date.now(),
          title: todoTitle.trim(),
          description: todoDescription.trim(),
          category: todoCategory,
          priority: todoPriority,
          dueDate: todoDueDate || null,
          completed: false,
          createdAt: new Date().toISOString()
        };
        onSaveTodo(entry);
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="quick-add-modal" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-sheet">
        <header className="modal-header">
          <h3>Quick Add</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </header>

        <nav className="modal-tabs" aria-label="Logging categories">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`modal-tab ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="modal-body">
          <p className="modal-copy">
            Capture your vibes in seconds. This mock shows how inputs adapt per
            category with pink-accented controls.
          </p>
          {activeTab === "fitness" ? (
            <div className="mock-form">
              <div className="exercise-checklist">
                <h4 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>
                  Exercise Checklist
                </h4>
                <div className="exercise-list">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="exercise-item">
                      <label className="exercise-checkbox">
                        <input
                          type="checkbox"
                          checked={exercise.completed}
                          onChange={() => toggleExercise(exercise.id)}
                        />
                        <span className={exercise.completed ? "completed" : ""}>
                          {exercise.name}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="remove-exercise"
                        onClick={() => removeExercise(exercise.id)}
                        aria-label="Remove exercise"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="add-exercise">
                  <input
                    type="text"
                    placeholder="Add new exercise..."
                    value={newExercise}
                    onChange={(e) => setNewExercise(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addExercise()}
                  />
                  <button type="button" onClick={addExercise} className="add-btn">
                    + Add
                  </button>
                </div>
              </div>
              <label style={{ marginTop: "16px" }}>
                <span>Notes</span>
                <textarea
                  placeholder="How did your workout feel?"
                  rows={3}
                  value={fitnessNotes}
                  onChange={(e) => setFitnessNotes(e.target.value)}
                />
              </label>
            </div>
          ) : activeTab === "attendance" ? (
            <div className="mock-form">
              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </label>
              <div className="attendance-checkbox-wrapper">
                <label className="attendance-checkbox-label">
                  <input
                    type="checkbox"
                    checked={attendedOffice}
                    onChange={(e) => setAttendedOffice(e.target.checked)}
                    className="attendance-checkbox-input"
                  />
                  <span className="attendance-checkbox-text">
                    I went to office today 🦋
                  </span>
                </label>
              </div>
              <label>
                <span>Notes (optional)</span>
                <textarea
                  placeholder="What happened at office today? Any highlights?"
                  rows={4}
                  value={attendanceNotes}
                  onChange={(e) => setAttendanceNotes(e.target.value)}
                />
              </label>
            </div>
          ) : activeTab === "calories" ? (
            <div className="mock-form">
              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={calorieDate}
                  onChange={(e) => setCalorieDate(e.target.value)}
                />
              </label>
              <label>
                <span>Meal Type</span>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">🌞 Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                  <option value="snacks">🍿 Snacks</option>
                </select>
              </label>
              <label>
                <span>Food Name</span>
                <input
                  placeholder="e.g., Grilled Chicken Salad"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                />
              </label>
              <div className="calorie-inputs">
                <label style={{ flex: 2 }}>
                  <span>Calories</span>
                  <input
                    type="number"
                    placeholder="250"
                    min="0"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                  />
                </label>
                <label style={{ flex: 1 }}>
                  <span>Portion</span>
                  <input
                    placeholder="1 bowl"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                  />
                </label>
              </div>
            </div>
          ) : activeTab === "expenses" ? (
            <div className="mock-form">
              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </label>
              <label>
                <span>Category</span>
                <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
                  <option value="food">🍽️ Food & Dining</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="shopping">🛍️ Shopping</option>
                  <option value="entertainment">🎬 Entertainment</option>
                  <option value="health">💊 Health & Fitness</option>
                  <option value="bills">📱 Bills & Utilities</option>
                  <option value="other">📦 Other</option>
                </select>
              </label>
              <label>
                <span>Description</span>
                <input
                  placeholder="e.g., Lunch at cafe"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                />
              </label>
              <label>
                <span>Amount (₹)</span>
                <input
                  type="number"
                  placeholder="500"
                  min="0"
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </label>
              <label>
                <span>Notes (optional)</span>
                <textarea
                  placeholder="Additional details..."
                  rows={2}
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                />
              </label>
            </div>
          ) : activeTab === "todos" ? (
            <div className="mock-form">
              <label>
                <span>Task Title</span>
                <input
                  placeholder="e.g., Complete project proposal"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                />
              </label>
              <div className="todo-row-inputs">
                <label style={{ flex: 1 }}>
                  <span>Category</span>
                  <select value={todoCategory} onChange={(e) => setTodoCategory(e.target.value)}>
                    <option value="work">💼 Work</option>
                    <option value="personal">✨ Personal</option>
                    <option value="fitness">💪 Fitness</option>
                    <option value="learning">📚 Learning</option>
                    <option value="shopping">🛒 Shopping</option>
                    <option value="other">📌 Other</option>
                  </select>
                </label>
                <label style={{ flex: 1 }}>
                  <span>Priority</span>
                  <select value={todoPriority} onChange={(e) => setTodoPriority(e.target.value)}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </label>
              </div>
              <label>
                <span>Due Date (optional)</span>
                <input
                  type="date"
                  value={todoDueDate}
                  onChange={(e) => setTodoDueDate(e.target.value)}
                />
              </label>
              <label>
                <span>Description (optional)</span>
                <textarea
                  placeholder="Add more details about this task..."
                  rows={3}
                  value={todoDescription}
                  onChange={(e) => setTodoDescription(e.target.value)}
                />
              </label>
            </div>
          ) : (
            <div className="mock-form">
              <label>
                <span>Title</span>
                <input placeholder={`Log ${activeTab}`} />
              </label>
              <label>
                <span>Details</span>
                <textarea placeholder="Add feel-good notes..." rows={3} />
              </label>
              <label>
                <span>Score</span>
                <input type="number" min="0" max="100" defaultValue="50" />
              </label>
            </div>
          )}
        </div>

        <footer className="modal-footer">
          <button type="button" className="modal-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="modal-primary" onClick={handleSave}>
            Save Sparkle
          </button>
        </footer>
      </div>
    </div>
  );
}

export default QuickAddModal;
