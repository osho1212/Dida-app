import { useState } from "react";

function SettingsPanel({ currentTheme, onThemeChange }) {
  const [reminders, setReminders] = useState([
    { id: 1, time: "07:30 AM", label: "Morning Glow" },
    { id: 2, time: "01:00 PM", label: "Midday Boost" },
    { id: 3, time: "08:30 PM", label: "Wind-down Wrap" }
  ]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [newReminderLabel, setNewReminderLabel] = useState("");
  const [editingReminder, setEditingReminder] = useState(null);

  const selectedTheme = currentTheme || "girly";

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

  const exportToPDF = () => {
    alert("Exporting Weekly PDF... (Feature coming soon!)");
  };

  const downloadCSV = () => {
    alert("Downloading CSV... (Feature coming soon!)");
  };

  return (
    <section className="settings-panel">
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
