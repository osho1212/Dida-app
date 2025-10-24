import { useEffect, useState } from "react";
import AttendanceCalendar from "./AttendanceCalendar.jsx";

const TASKS_STORAGE_KEY = "dida-glow-list";

const defaultTasks = [
  { id: 1, title: "Prep client deck sparkle", time: "Due 3 PM", tag: "Priority", completed: false },
  { id: 2, title: "Lunch walk & hydrate", time: "1:00 PM", tag: "Wellness", completed: false },
  { id: 3, title: "Submit expense slips", time: "4:30 PM", tag: "Finance", completed: false },
  { id: 4, title: "Glow journaling", time: "9:00 PM", tag: "Reflection", completed: false }
];

function loadTasks() {
  if (typeof window === "undefined") return defaultTasks;
  try {
    const stored = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (!stored) return defaultTasks;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultTasks;
  } catch (error) {
    return defaultTasks;
  }
}

function persistTasks(nextTasks) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(nextTasks));
  } catch (error) {
    // Ignore storage failures; list simply won't persist.
  }
}

function TaskAttendance({ attendanceData, onDateToggle }) {
  const [tasks, setTasks] = useState(loadTasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskTag, setNewTaskTag] = useState("Priority");
  const attendanceDates = attendanceData?.dates || [];
  const attendanceNotes = attendanceData?.notes || {};

  useEffect(() => {
    persistTasks(tasks);
  }, [tasks]);
  const getStreakCount = () => {
    if (attendanceDates.length === 0) return 0;
    const sorted = [...attendanceDates].sort().reverse();
    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(sorted[i]);
      const next = new Date(sorted[i + 1]);
      const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      time: newTaskTime || "No time set",
      tag: newTaskTag,
      completed: false
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle("");
    setNewTaskTime("");
    setNewTaskTag("Priority");
    setShowAddForm(false);
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <section className="task-attendance">
      <div className="task-list">
        <header>
          <h3>Glow List</h3>
          <button type="button" className="add-task" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "− Cancel" : "+ Add Task"}
          </button>
        </header>

        {showAddForm && (
          <div className="add-task-form">
            <input
              type="text"
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="task-input"
            />
            <input
              type="text"
              placeholder="Time (e.g., Due 3 PM)..."
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="task-input"
            />
            <select
              value={newTaskTag}
              onChange={(e) => setNewTaskTag(e.target.value)}
              className="task-tag-select"
            >
              <option value="Priority">Priority</option>
              <option value="Wellness">Wellness</option>
              <option value="Finance">Finance</option>
              <option value="Reflection">Reflection</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
            </select>
            <button type="button" className="save-task-btn" onClick={addTask}>
              Save Task
            </button>
          </div>
        )}

        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.time}</span>
                </div>
              </label>
              <div className="task-actions">
                <span className="task-tag">{task.tag}</span>
                <button
                  type="button"
                  className="delete-task-btn"
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p className="no-tasks-message">No tasks yet. Add your first glow task! ✨</p>
        )}
      </div>

      <div className="attendance-section">
        <header>
          <h3>Office Attendance Calendar</h3>
          <span className="attendance-pill">{getStreakCount()}-day streak</span>
        </header>
        <AttendanceCalendar
          attendanceDates={attendanceDates}
          attendanceNotes={attendanceNotes}
          onDateToggle={onDateToggle}
        />
        <p className="calendar-hint">Click any day to mark/unmark office attendance 🦋</p>
      </div>
    </section>
  );
}

export default TaskAttendance;
