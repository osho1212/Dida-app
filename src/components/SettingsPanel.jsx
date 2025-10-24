import { useEffect, useMemo, useState } from "react";
import { DEFAULT_TARGETS } from "../constants/defaultTargets.js";

const REMINDERS_STORAGE_KEY = "dida-reminders";

const defaultReminders = [
  { id: 1, time: "07:30 AM", label: "Morning Glow" },
  { id: 2, time: "01:00 PM", label: "Midday Boost" },
  { id: 3, time: "08:30 PM", label: "Wind-down Wrap" }
];

function loadReminders() {
  if (typeof window === "undefined") return defaultReminders;
  try {
    const stored = window.localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!stored) return defaultReminders;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : defaultReminders;
  } catch (error) {
    return defaultReminders;
  }
}

function persistReminders(nextReminders) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(nextReminders));
  } catch (error) {
    // Ignore failures; reminders simply won't persist.
  }
}

function SettingsPanel({
  currentTheme,
  onThemeChange,
  notificationStatus,
  user,
  profile,
  onSignOut,
  onOpenAuth,
  targets,
  onUpdateTargets
}) {
  const [reminders, setReminders] = useState(loadReminders);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newReminderLabel, setNewReminderLabel] = useState("");
  const [editingReminder, setEditingReminder] = useState(null);
  const [targetDraft, setTargetDraft] = useState(targets ?? DEFAULT_TARGETS);

  useEffect(() => {
    persistReminders(reminders);
  }, [reminders]);

  const selectedTheme = currentTheme || "girly";
  const isAnonymous = user?.isAnonymous ?? true;
  const accountName = profile?.displayName ?? user?.displayName ?? "Guest Glimmer";
  const accountEmail = user?.email ?? profile?.email ?? null;
  const handleTargetChange = (field, value) => {
    setTargetDraft((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const hasTargetChanges = useMemo(() => {
    if (!targets) return false;
    return Object.keys(DEFAULT_TARGETS).some((key) => {
      const currentVal = Number(targets?.[key] ?? DEFAULT_TARGETS[key]);
      const draftVal = Number(targetDraft?.[key] ?? DEFAULT_TARGETS[key]);
      return currentVal !== draftVal;
    });
  }, [targetDraft, targets]);

  const themes = [
    {
      id: "girly",
      name: "Girly Glow",
      class: "swatch-inner--girly"
    },
    { id: "sunrise", name: "Sunrise Burst", class: "swatch-inner--sunrise" },
    { id: "ocean", name: "Ocean Calm", class: "swatch-inner--ocean" },
    { id: "royal", name: "Sapphire Dream", class: "swatch-inner--royal" }
  ];

  const addReminder = () => {
    if (!newReminderTime || !newReminderLabel) return;

    const newReminder = {
      id: Date.now(),
      time: newReminderTime,
      label: newReminderLabel
    };

    setReminders(prev => [...prev, newReminder]);
    setNewReminderTime("");
    setNewReminderLabel("");
    setShowAddReminder(false);
  };

  const deleteReminder = (id) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const startEdit = (reminder) => {
    setEditingReminder(reminder);
    setNewReminderTime(reminder.time);
    setNewReminderLabel(reminder.label);
  };

  const saveEdit = () => {
    if (!editingReminder || !newReminderTime || !newReminderLabel) return;

    setReminders(prev => prev.map(reminder =>
      reminder.id === editingReminder.id
        ? { ...reminder, time: newReminderTime, label: newReminderLabel }
        : reminder
    ));
    setEditingReminder(null);
    setNewReminderTime("");
    setNewReminderLabel("");
  };

  const cancelEdit = () => {
    setEditingReminder(null);
    setNewReminderTime("");
    setNewReminderLabel("");
  };

  const saveTargets = async () => {
    if (!onUpdateTargets) return;
    await onUpdateTargets({
      fitnessDailyExercises: Number(targetDraft.fitnessDailyExercises),
      calorieDailyGoal: Number(targetDraft.calorieDailyGoal),
      expenseDailyBudget: Number(targetDraft.expenseDailyBudget),
      expenseMonthlyBudget: Number(targetDraft.expenseMonthlyBudget),
      todoDailyTarget: Number(targetDraft.todoDailyTarget)
    });
  };

  const exportToPDF = () => {
    alert("Exporting Weekly PDF... (Feature coming soon!)");
  };

  const downloadCSV = () => {
    alert("Downloading CSV... (Feature coming soon!)");
  };

  const notificationCopy = useMemo(() => {
    if (!notificationStatus) return null;
    if (notificationStatus.permission === "granted" && notificationStatus.tokenStatus === "success") {
      return "Real-time reminders are enabled on this device.";
    }
    if (notificationStatus.permission === "denied") {
      return "Notifications are blocked. Enable them in your browser settings.";
    }
    if (notificationStatus.tokenStatus === "error" && notificationStatus.error) {
      return notificationStatus.error.message;
    }
    return "Enable push reminders to get gentle nudges throughout your day.";
  }, [notificationStatus]);

  useEffect(() => {
    if (targets) {
      setTargetDraft(targets);
    }
  }, [targets]);

  return (
    <section className="settings-panel">
      <div className="account-card">
        <h3>Account</h3>
        <p>
          {isAnonymous
            ? "Create a profile to sync data across devices and unlock weekly digests."
            : "Manage your personal details and sign out from your glow hub."}
        </p>
        <div className="account-details">
          <div className="account-pill">
            <span className="account-name">{accountName}</span>
            {accountEmail && <span className="account-email">{accountEmail}</span>}
            {!accountEmail && isAnonymous && (
              <span className="account-email muted">No email connected</span>
            )}
          </div>
          <div className="account-actions">
            {isAnonymous ? (
              <button
                type="button"
                className="pill-button"
                onClick={() => onOpenAuth && onOpenAuth()}
              >
                Sign in or create account
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="pill-button pill-button--outline"
                  onClick={() => onOpenAuth && onOpenAuth()}
                >
                  Edit profile
                </button>
                <button type="button" className="pill-button" onClick={() => onSignOut && onSignOut()}>
                  Sign out
                </button>
              </>
            )}
          </div>
      </div>
    </div>

      <div className="targets-card">
        <h4>Daily Targets</h4>
        <p>Fine-tune goals for each tracker to match your personal rhythm.</p>
        <div className="targets-grid">
          <label>
            <span>Fitness moves / day</span>
            <input
              type="number"
              min={1}
              value={targetDraft.fitnessDailyExercises ?? DEFAULT_TARGETS.fitnessDailyExercises}
              onChange={(e) => handleTargetChange("fitnessDailyExercises", e.target.value)}
            />
          </label>
          <label>
            <span>Calorie goal</span>
            <input
              type="number"
              min={500}
              step={10}
              value={targetDraft.calorieDailyGoal ?? DEFAULT_TARGETS.calorieDailyGoal}
              onChange={(e) => handleTargetChange("calorieDailyGoal", e.target.value)}
            />
          </label>
          <label>
            <span>Daily spend budget</span>
            <input
              type="number"
              min={100}
              step={50}
              value={targetDraft.expenseDailyBudget ?? DEFAULT_TARGETS.expenseDailyBudget}
              onChange={(e) => handleTargetChange("expenseDailyBudget", e.target.value)}
            />
          </label>
          <label>
            <span>Monthly spend cap</span>
            <input
              type="number"
              min={500}
              step={100}
              value={targetDraft.expenseMonthlyBudget ?? DEFAULT_TARGETS.expenseMonthlyBudget}
              onChange={(e) => handleTargetChange("expenseMonthlyBudget", e.target.value)}
            />
          </label>
          <label>
            <span>To-dos per day</span>
            <input
              type="number"
              min={1}
              value={targetDraft.todoDailyTarget ?? DEFAULT_TARGETS.todoDailyTarget}
              onChange={(e) => handleTargetChange("todoDailyTarget", e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className="pill-button"
          disabled={!hasTargetChanges || !onUpdateTargets}
          onClick={saveTargets}
        >
          Save targets
        </button>
      </div>

      <div className="profile-card">
        <h3>Profile Aura</h3>
        <p>Customize your palette, reminders, and data rituals.</p>
        <div className="theme-swatches">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`swatch ${
                selectedTheme === theme.id ? "is-active" : ""
              }`}
              onClick={() => onThemeChange && onThemeChange(theme.id)}
            >
              <span className={`swatch-inner ${theme.class}`} />
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div className="notification-card">
        <h4>Push Glow</h4>
        <p>{notificationCopy}</p>
        <div className="notification-actions">
          <button
            type="button"
            className="pill-button"
            disabled={
              !notificationStatus ||
              notificationStatus.permission === "denied" ||
              notificationStatus.tokenStatus === "pending" ||
              notificationStatus.tokenStatus === "success"
            }
            onClick={notificationStatus?.requestPermission}
          >
            {notificationStatus?.tokenStatus === "pending"
              ? "Setting up…"
              : notificationStatus?.permission === "granted"
                ? "Enabled"
                : "Enable Notifications"}
          </button>
          {notificationStatus?.lastMessage && (
            <div className="notification-preview">
              <span className="preview-label">Last ping:</span>
              <strong>{notificationStatus.lastMessage.notification?.title ?? "Reminder received"}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="reminder-card">
        <h4>Reminder Rhythm</h4>
        <ul>
          {reminders.map((reminder) => (
            <li key={reminder.id}>
              <span>{reminder.time} {reminder.label}</span>
              <div className="reminder-actions">
                <button type="button" onClick={() => startEdit(reminder)}>Edit</button>
                <button type="button" className="delete-reminder-btn" onClick={() => deleteReminder(reminder.id)}>×</button>
              </div>
            </li>
          ))}
        </ul>

        {editingReminder && (
          <div className="edit-reminder-form">
            <h5>Edit Reminder</h5>
            <input
              type="text"
              placeholder="Time (e.g., 07:30 AM)"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              className="reminder-input"
            />
            <input
              type="text"
              placeholder="Label (e.g., Morning Glow)"
              value={newReminderLabel}
              onChange={(e) => setNewReminderLabel(e.target.value)}
              className="reminder-input"
            />
            <div className="reminder-form-actions">
              <button type="button" className="save-reminder-btn" onClick={saveEdit}>Save</button>
              <button type="button" className="cancel-reminder-btn" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        )}

        {showAddReminder && (
          <div className="edit-reminder-form">
            <h5>Add New Reminder</h5>
            <input
              type="text"
              placeholder="Time (e.g., 07:30 AM)"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              className="reminder-input"
            />
            <input
              type="text"
              placeholder="Label (e.g., Morning Glow)"
              value={newReminderLabel}
              onChange={(e) => setNewReminderLabel(e.target.value)}
              className="reminder-input"
            />
            <div className="reminder-form-actions">
              <button type="button" className="save-reminder-btn" onClick={addReminder}>Add</button>
              <button type="button" className="cancel-reminder-btn" onClick={() => {
                setShowAddReminder(false);
                setNewReminderTime("");
                setNewReminderLabel("");
              }}>Cancel</button>
            </div>
          </div>
        )}

        <button type="button" className="add-reminder" onClick={() => setShowAddReminder(!showAddReminder)}>
          {showAddReminder ? "− Cancel" : "+ Add Reminder"}
        </button>
      </div>

      <div className="data-card">
        <h4>Data & Privacy</h4>
        <p>Export a weekly sparkle digest or download raw data.</p>
        <div className="data-actions">
          <button type="button" className="pill-button" onClick={exportToPDF}>
            Export Weekly PDF
          </button>
          <button type="button" className="pill-button pill-button--outline" onClick={downloadCSV}>
            Download CSV
          </button>
        </div>
      </div>
    </section>
  );
}

export default SettingsPanel;
