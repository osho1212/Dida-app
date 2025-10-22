import { useMemo, useState } from "react";
import DashboardHeader from "./components/DashboardHeader.jsx";
import ModuleCarousel from "./components/ModuleCarousel.jsx";
import DailyPie from "./components/DailyPie.jsx";
import QuickAddModal from "./components/QuickAddModal.jsx";
import WeeklyInsights from "./components/WeeklyInsights.jsx";
import TaskAttendance from "./components/TaskAttendance.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import CalorieTracker from "./components/CalorieTracker.jsx";
import ExpenseTracker from "./components/ExpenseTracker.jsx";
import TodoTracker from "./components/TodoTracker.jsx";
import StreakCalendar from "./components/StreakCalendar.jsx";

const VIEWS = [
  { id: "daily", label: "Daily Hub" },
  { id: "calories", label: "Calorie Tracker" },
  { id: "expenses", label: "Expense Tracker" },
  { id: "todos", label: "To-Do Tracker" },
  { id: "weekly", label: "Weekly Insights" },
  { id: "tasks", label: "Tasks & Attendance" },
  { id: "settings", label: "Profile & Settings" }
];

function App() {
  const [activeView, setActiveView] = useState("daily");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("girly");
  const [fitnessLogs, setFitnessLogs] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    dates: ['2025-10-01', '2025-10-03', '2025-10-05', '2025-10-08', '2025-10-10',
            '2025-10-12', '2025-10-15', '2025-10-17', '2025-10-19', '2025-10-22'],
    notes: {}
  });
  const [calorieData, setCalorieData] = useState([
    { id: 1, date: '2025-10-22', foodName: 'Oatmeal with berries', calories: 300, portion: '1 bowl', mealType: 'breakfast' },
    { id: 2, date: '2025-10-22', foodName: 'Banana', calories: 105, portion: '1 medium', mealType: 'snacks' },
    { id: 3, date: '2025-10-22', foodName: 'Grilled Chicken Salad', calories: 450, portion: '1 plate', mealType: 'lunch' }
  ]);
  const [expenseData, setExpenseData] = useState([
    { id: 1, date: '2025-10-22', description: 'Coffee & Breakfast', amount: 250, category: 'food', notes: 'Morning cafe', timestamp: new Date().toISOString() },
    { id: 2, date: '2025-10-22', description: 'Uber ride', amount: 180, category: 'transport', notes: 'To office', timestamp: new Date().toISOString() },
    { id: 3, date: '2025-10-22', description: 'Grocery shopping', amount: 1500, category: 'shopping', notes: 'Weekly groceries', timestamp: new Date().toISOString() },
    { id: 4, date: '2025-10-21', description: 'Netflix subscription', amount: 649, category: 'entertainment', notes: '', timestamp: new Date().toISOString() }
  ]);
  const [todoData, setTodoData] = useState([
    { id: 1, title: 'Complete project proposal', description: 'Finish the Q4 proposal document', category: 'work', priority: 'high', dueDate: '2025-10-25', completed: false, createdAt: new Date().toISOString() },
    { id: 2, title: 'Morning yoga session', description: '', category: 'fitness', priority: 'medium', dueDate: '2025-10-22', completed: true, createdAt: new Date().toISOString() },
    { id: 3, title: 'Buy groceries', description: 'Get vegetables, fruits, milk', category: 'shopping', priority: 'medium', dueDate: '2025-10-23', completed: false, createdAt: new Date().toISOString() },
    { id: 4, title: 'Read JavaScript book chapter 5', description: '', category: 'learning', priority: 'low', dueDate: null, completed: false, createdAt: new Date().toISOString() },
    { id: 5, title: 'Call mom', description: '', category: 'personal', priority: 'high', dueDate: '2025-10-22', completed: false, createdAt: new Date().toISOString() }
  ]);

  const actions = useMemo(
    () => ({
      openQuickAdd: () => setShowQuickAdd(true),
      closeQuickAdd: () => setShowQuickAdd(false),
      saveFitnessLog: (log) => {
        setFitnessLogs(prev => [log, ...prev]);
        setShowQuickAdd(false);
      },
      saveAttendanceLog: (dateStr, notes) => {
        setAttendanceData(prev => {
          const newDates = prev.dates.includes(dateStr)
            ? prev.dates
            : [...prev.dates, dateStr];
          const newNotes = { ...prev.notes };
          if (notes && notes.trim()) {
            newNotes[dateStr] = notes.trim();
          }
          return { dates: newDates, notes: newNotes };
        });
        setShowQuickAdd(false);
      },
      toggleAttendanceDate: (dateStr) => {
        setAttendanceData(prev => ({
          ...prev,
          dates: prev.dates.includes(dateStr)
            ? prev.dates.filter(d => d !== dateStr)
            : [...prev.dates, dateStr]
        }));
      },
      saveCalorie: (entry) => {
        setCalorieData(prev => [...prev, entry]);
        setShowQuickAdd(false);
      },
      deleteCalorieEntry: (entryId) => {
        setCalorieData(prev => prev.filter(entry => entry.id !== entryId));
      },
      saveExpense: (entry) => {
        setExpenseData(prev => [...prev, entry]);
        setShowQuickAdd(false);
      },
      deleteExpenseEntry: (entryId) => {
        setExpenseData(prev => prev.filter(entry => entry.id !== entryId));
      },
      saveTodo: (entry) => {
        setTodoData(prev => [...prev, entry]);
        setShowQuickAdd(false);
      },
      toggleTodo: (todoId) => {
        setTodoData(prev => prev.map(todo =>
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
        ));
      },
      deleteTodo: (todoId) => {
        setTodoData(prev => prev.filter(todo => todo.id !== todoId));
      }
    }),
    []
  );

  return (
    <div className={`app-shell theme-${currentTheme}`}>
      <aside className="hero-onboarding">
        <div className="sparkle" />
        <p className="hero-eyebrow">Meet Dida</p>
        <h1 className="hero-title">Your Daily Glow Up</h1>
        <p className="hero-copy">
          Track workouts, calories, expenses, office vibes, and to-dos in one
          glamorous cockpit. Designed for cross-device magic—mobile, desktop,
          and iPad ready.
        </p>
        <button className="cta-button">Preview Prototype</button>
      </aside>

      <main className="main-panel">
        <DashboardHeader onQuickAdd={actions.openQuickAdd} />

        <nav className="view-switcher" aria-label="Primary views">
          {VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              className={`view-pill ${activeView === view.id ? "is-active" : ""}`}
              onClick={() => setActiveView(view.id)}
            >
              {view.label}
            </button>
          ))}
        </nav>

        <div className="view-content" role="region">
          {activeView === "daily" && (
            <>
              <ModuleCarousel onQuickAdd={actions.openQuickAdd} />
              <DailyPie />
              <StreakCalendar
                fitnessLogs={fitnessLogs}
                calorieData={calorieData}
                expenseData={expenseData}
                todoData={todoData}
                attendanceData={attendanceData}
              />
              {fitnessLogs.length > 0 && (
                <div className="fitness-logs-section">
                  <h2 className="section-title">Recent Fitness Logs</h2>
                  <div className="fitness-logs-grid">
                    {fitnessLogs.map((log) => (
                      <div key={log.id} className="fitness-log-card">
                        <div className="log-header">
                          <span className="log-date">{log.date}</span>
                          <span className="log-time">{log.time}</span>
                        </div>
                        <div className="log-exercises">
                          <h4>Exercises Completed:</h4>
                          <ul>
                            {log.exercises.filter(ex => ex.completed).map((ex) => (
                              <li key={ex.id}>✓ {ex.name}</li>
                            ))}
                          </ul>
                        </div>
                        {log.notes && (
                          <div className="log-notes">
                            <strong>Notes:</strong> {log.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeView === "calories" && (
            <CalorieTracker
              calorieData={calorieData}
              onDeleteEntry={actions.deleteCalorieEntry}
            />
          )}

          {activeView === "expenses" && (
            <ExpenseTracker
              expenseData={expenseData}
              onDeleteEntry={actions.deleteExpenseEntry}
            />
          )}

          {activeView === "todos" && (
            <TodoTracker
              todoData={todoData}
              onToggleTodo={actions.toggleTodo}
              onDeleteTodo={actions.deleteTodo}
            />
          )}

          {activeView === "weekly" && (
            <WeeklyInsights
              fitnessLogs={fitnessLogs}
              calorieData={calorieData}
              expenseData={expenseData}
              todoData={todoData}
              attendanceData={attendanceData}
            />
          )}

          {activeView === "tasks" && (
            <TaskAttendance
              attendanceData={attendanceData}
              onDateToggle={actions.toggleAttendanceDate}
            />
          )}

          {activeView === "settings" && (
            <SettingsPanel
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
            />
          )}
        </div>
      </main>

      {showQuickAdd && (
        <QuickAddModal
          onClose={actions.closeQuickAdd}
          onSaveFitness={actions.saveFitnessLog}
          onSaveAttendance={actions.saveAttendanceLog}
          onSaveCalorie={actions.saveCalorie}
          onSaveExpense={actions.saveExpense}
          onSaveTodo={actions.saveTodo}
        />
      )}
    </div>
  );
}

export default App;
