import { useMemo, useState } from "react";
import { useFirebase } from "./providers/FirebaseProvider.jsx";
import useFirebaseMessaging from "./hooks/useFirebaseMessaging.js";
import useUserCollection from "./firebase/hooks/useUserCollection.js";
import useUserTargets from "./firebase/hooks/useUserTargets.js";
import useUserTheme from "./firebase/hooks/useUserTheme.js";
import { db } from "./firebase/client.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import AuthModal from "./components/AuthModal.jsx";
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
import { buildDailyDashboardData } from "./utils/dashboardMetrics.js";

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
  const { user, profile, loading: authLoading, actions: authActions } = useFirebase();
  const notificationStatus = useFirebaseMessaging(user);
  const [activeView, setActiveView] = useState("daily");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { theme: currentTheme, loading: themeLoading, updateTheme } = useUserTheme(user);

  const { data: fitnessLogsRaw } = useUserCollection(user, "fitnessLogs", {
    orderBy: ["timestamp", "desc"],
    limit: 100
  });
  const { data: calorieDataRaw } = useUserCollection(user, "calories", {
    orderBy: ["timestamp", "desc"],
    limit: 100
  });
  const { data: expenseDataRaw } = useUserCollection(user, "expenses", {
    orderBy: ["timestamp", "desc"],
    limit: 100
  });
  const { data: todoDataRaw } = useUserCollection(user, "todos", {
    orderBy: ["createdAt", "desc"],
    limit: 100
  });
  const { data: attendanceDataRaw } = useUserCollection(user, "attendance", {
    orderBy: ["date", "desc"],
    limit: 100
  });

  const { targets, updateTargets } = useUserTargets(user);

  const fitnessLogs = fitnessLogsRaw ?? [];
  const calorieData = calorieDataRaw ?? [];
  const expenseData = expenseDataRaw ?? [];
  const todoData = todoDataRaw ?? [];
  const attendanceData = useMemo(() => {
    const rawData = attendanceDataRaw ?? [];
    const dates = rawData.map((item) => item.date).filter(Boolean);
    const notes = rawData.reduce((acc, item) => {
      if (item.date && item.notes) {
        acc[item.date] = item.notes;
      }
      return acc;
    }, {});
    return { dates, notes };
  }, [attendanceDataRaw]);

  const dashboardData = useMemo(() => {
    return buildDailyDashboardData(
      {
        fitnessLogs,
        calorieData,
        expenseData,
        todoData,
        attendanceData
      },
      targets
    );
  }, [fitnessLogs, calorieData, expenseData, todoData, attendanceData, targets]);

  const actions = useMemo(
    () => ({
      openQuickAdd: () => setShowQuickAdd(true),
      closeQuickAdd: () => setShowQuickAdd(false),
      saveFitnessLog: async (log) => {
        if (!user || !db) return;
        await addDoc(collection(db, "users", user.uid, "fitnessLogs"), {
          ...log,
          timestamp: serverTimestamp()
        });
        setShowQuickAdd(false);
      },
      saveAttendanceLog: async (dateStr, notes) => {
        if (!user || !db) return;
        const attendanceRef = doc(db, "users", user.uid, "attendance", dateStr);
        await setDoc(attendanceRef, {
          date: dateStr,
          notes: notes || "",
          timestamp: serverTimestamp()
        });
        setShowQuickAdd(false);
      },
      toggleAttendanceDate: async (dateStr) => {
        if (!user || !db) return;
        const attendanceRef = doc(db, "users", user.uid, "attendance", dateStr);
        const exists = attendanceData.dates.includes(dateStr);
        if (exists) {
          await deleteDoc(attendanceRef);
        } else {
          await setDoc(attendanceRef, {
            date: dateStr,
            notes: "",
            timestamp: serverTimestamp()
          });
        }
      },
      saveCalorie: async (entry) => {
        if (!user || !db) return;
        await addDoc(collection(db, "users", user.uid, "calories"), {
          ...entry,
          timestamp: serverTimestamp()
        });
        setShowQuickAdd(false);
      },
      deleteCalorieEntry: async (entryId) => {
        if (!user || !db) return;
        await deleteDoc(doc(db, "users", user.uid, "calories", entryId));
      },
      saveExpense: async (entry) => {
        if (!user || !db) return;
        await addDoc(collection(db, "users", user.uid, "expenses"), {
          ...entry,
          timestamp: serverTimestamp()
        });
        setShowQuickAdd(false);
      },
      deleteExpenseEntry: async (entryId) => {
        if (!user || !db) return;
        await deleteDoc(doc(db, "users", user.uid, "expenses", entryId));
      },
      saveTodo: async (entry) => {
        if (!user || !db) return;
        await addDoc(collection(db, "users", user.uid, "todos"), {
          ...entry,
          createdAt: serverTimestamp()
        });
        setShowQuickAdd(false);
      },
      toggleTodo: async (todoId) => {
        if (!user || !db) return;
        const todo = todoData.find((t) => t.id === todoId);
        if (!todo) return;
        await updateDoc(doc(db, "users", user.uid, "todos", todoId), {
          completed: !todo.completed
        });
      },
      deleteTodo: async (todoId) => {
        if (!user || !db) return;
        await deleteDoc(doc(db, "users", user.uid, "todos", todoId));
      },
      updateTargets
    }),
    [user, db, todoData, attendanceData, updateTargets]
  );

  const displayName = profile?.displayName || user?.displayName || "DIDA ❤️";

  if (authLoading || themeLoading) {
    return (
      <div className="app-shell loading-state">
        <div className="loading-card">
          <span className="loading-spinner" aria-hidden="true" />
          <p>Loading your glow preferences…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell theme-${currentTheme || "girly"}`}>
      <aside className="hero-onboarding">
        <div className="sparkle" />
        <p className="hero-eyebrow">Meet Dida</p>
        <h1 className="hero-title">Your Daily Glow Up</h1>
        <p className="hero-copy">
          Track workouts, calories, expenses, office vibes, and to-dos in one
          glamorous cockpit. Designed for cross-device magic—mobile, desktop,
          and iPad ready.
        </p>
        <button className="cta-button" onClick={() => setShowAuthModal(true)}>
          {user?.isAnonymous ? "Sign In / Register" : "Preview Prototype"}
        </button>
      </aside>

      <main className="main-panel">
        <DashboardHeader
          onQuickAdd={actions.openQuickAdd}
          displayName={displayName}
          stats={dashboardData.headerStats}
        />

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
              <ModuleCarousel
                modules={dashboardData.modules}
                onQuickAdd={actions.openQuickAdd}
              />
              <DailyPie slices={dashboardData.slices} />
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
                    {fitnessLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="fitness-log-card">
                        <div className="log-header">
                          <span className="log-date">{log.prettyDate || log.date}</span>
                          <span className="log-time">{log.time}</span>
                        </div>
                        <div className="log-exercises">
                          <h4>Exercises Completed:</h4>
                          <ul>
                            {(log.exercises || [])
                              .filter((ex) => ex.completed)
                              .map((ex, idx) => (
                                <li key={idx}>✓ {ex.name}</li>
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
              calorieGoal={targets?.calorieDailyGoal}
              onUpdateGoal={async (newGoal) => {
                await updateTargets({ calorieDailyGoal: newGoal });
              }}
            />
          )}

          {activeView === "expenses" && (
            <ExpenseTracker
              expenseData={expenseData}
              onDeleteEntry={actions.deleteExpenseEntry}
              dailyBudget={targets?.expenseDailyBudget}
              monthlyBudget={targets?.expenseMonthlyBudget}
              onUpdateBudgets={async (dailyBudget, monthlyBudget) => {
                await updateTargets({
                  expenseDailyBudget: dailyBudget,
                  expenseMonthlyBudget: monthlyBudget
                });
              }}
            />
          )}

          {activeView === "todos" && (
            <TodoTracker
              todoData={todoData}
              onToggleTodo={actions.toggleTodo}
              onDeleteTodo={actions.deleteTodo}
              dailyTarget={targets?.todoDailyTarget}
              onUpdateTarget={async (newTarget) => {
                await updateTargets({ todoDailyTarget: newTarget });
              }}
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
              onThemeChange={updateTheme}
              notificationStatus={notificationStatus}
              user={user}
              profile={profile}
              targets={targets}
              onUpdateTargets={actions.updateTargets}
              onOpenAuth={() => setShowAuthModal(true)}
              onSignOut={authActions.signOut}
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

      {showAuthModal && (
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

export default App;
