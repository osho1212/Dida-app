import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../client.js";

const DEFAULT_REMINDERS = [
  { id: "morning", time: "07:30", label: "Morning Glow", enabled: true },
  { id: "midday", time: "13:00", label: "Midday Boost", enabled: true },
  { id: "evening", time: "20:30", label: "Wind-down Wrap", enabled: true }
];

/**
 * Hook to manage user's notification reminders synced with Firestore
 * @param {Object} user - Firebase user object
 * @returns {Object} - { reminders, addReminder, updateReminder, deleteReminder, toggleReminder }
 */
function useUserReminders(user) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to user's reminders collection
  useEffect(() => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return undefined;
    }

    const remindersRef = doc(db, "users", user.uid, "settings", "reminders");

    const unsubscribe = onSnapshot(
      remindersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const reminderList = data.list || DEFAULT_REMINDERS;
          setReminders(reminderList);
        } else {
          // Initialize with defaults if no reminders exist
          setReminders(DEFAULT_REMINDERS);
          setDoc(remindersRef, {
            list: DEFAULT_REMINDERS,
            updatedAt: serverTimestamp()
          }).catch(() => {
            // Ignore initialization errors
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching reminders:", error);
        setReminders(DEFAULT_REMINDERS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  /**
   * Add a new reminder
   */
  const addReminder = async (time, label, date = null) => {
    if (!user || !time || !label) return false;

    const newReminder = {
      id: `reminder_${Date.now()}`,
      time,
      label,
      date, // null for daily, specific date for one-time
      enabled: true
    };

    const updatedReminders = [...reminders, newReminder];

    try {
      const remindersRef = doc(db, "users", user.uid, "settings", "reminders");
      await setDoc(remindersRef, {
        list: updatedReminders,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error adding reminder:", error);
      return false;
    }
  };

  /**
   * Update an existing reminder
   */
  const updateReminder = async (id, time, label, date = null) => {
    if (!user || !id || !time || !label) return false;

    const updatedReminders = reminders.map(reminder =>
      reminder.id === id
        ? { ...reminder, time, label, date }
        : reminder
    );

    try {
      const remindersRef = doc(db, "users", user.uid, "settings", "reminders");
      await setDoc(remindersRef, {
        list: updatedReminders,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error updating reminder:", error);
      return false;
    }
  };

  /**
   * Delete a reminder
   */
  const deleteReminder = async (id) => {
    if (!user || !id) return false;

    const updatedReminders = reminders.filter(reminder => reminder.id !== id);

    try {
      const remindersRef = doc(db, "users", user.uid, "settings", "reminders");
      await setDoc(remindersRef, {
        list: updatedReminders,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error deleting reminder:", error);
      return false;
    }
  };

  /**
   * Toggle reminder enabled/disabled
   */
  const toggleReminder = async (id) => {
    if (!user || !id) return false;

    const updatedReminders = reminders.map(reminder =>
      reminder.id === id
        ? { ...reminder, enabled: !reminder.enabled }
        : reminder
    );

    try {
      const remindersRef = doc(db, "users", user.uid, "settings", "reminders");
      await setDoc(remindersRef, {
        list: updatedReminders,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error toggling reminder:", error);
      return false;
    }
  };

  return {
    reminders,
    loading,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder
  };
}

export default useUserReminders;
