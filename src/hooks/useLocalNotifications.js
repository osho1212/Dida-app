import { useEffect } from "react";

/**
 * Hook to schedule local browser notifications based on user's reminders
 * This works immediately without needing Firebase Cloud Functions
 * @param {Array} reminders - List of reminder objects with time and enabled status
 * @param {Object} notificationStatus - Notification permission status from useFirebaseMessaging
 */
function useLocalNotifications(reminders, notificationStatus) {
  useEffect(() => {
    console.log("🔔 useLocalNotifications hook running...");
    console.log("Notification permission:", notificationStatus?.permission);
    console.log("Reminders:", reminders);

    // Only proceed if notifications are enabled and granted
    if (
      !notificationStatus ||
      notificationStatus.permission !== "granted" ||
      !reminders ||
      reminders.length === 0
    ) {
      console.log("❌ Not scheduling notifications. Reason:");
      if (!notificationStatus) console.log("  - No notification status");
      if (notificationStatus?.permission !== "granted")
        console.log(
          "  - Permission not granted:",
          notificationStatus?.permission
        );
      if (!reminders) console.log("  - No reminders");
      if (reminders && reminders.length === 0)
        console.log("  - Reminders array is empty");
      return;
    }

    console.log("✅ Scheduling notifications for", reminders.length, "reminders");
    const scheduledTimeouts = [];

    // Function to schedule a notification
    const scheduleNotification = (reminder) => {
      if (!reminder.enabled) return;

      // Parse reminder time (HH:MM format)
      const [hours, minutes] = reminder.time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) return;

      // Get current time
      const now = new Date();

      let targetTime;

      if (reminder.date) {
        // One-time reminder with specific date
        targetTime = new Date(reminder.date);
        targetTime.setHours(hours, minutes, 0, 0);

        // If the reminder date has passed, don't schedule
        if (targetTime.getTime() < now.getTime()) {
          console.log(`⏭️  Skipping past reminder: "${reminder.label}"`);
          return;
        }
      } else {
        // Daily reminder
        targetTime = new Date();
        targetTime.setHours(hours, minutes, 0, 0);

        // If target time has passed today, schedule for tomorrow
        if (targetTime.getTime() < now.getTime()) {
          targetTime.setDate(targetTime.getDate() + 1);
        }
      }

      // Calculate milliseconds until target time
      const msUntilTarget = targetTime.getTime() - now.getTime();

      console.log(
        `Scheduled "${reminder.label}" ${reminder.date ? "📅" : "🔄"} for ${targetTime.toLocaleString()} (in ${Math.round(msUntilTarget / 1000 / 60)} minutes)`
      );

      // Schedule the notification
      const timeoutId = setTimeout(() => {
        // Check if permission is still granted
        if (Notification.permission === "granted") {
          const notification = new Notification(reminder.label, {
            body: reminder.date
              ? "Your scheduled reminder! 🔔"
              : "Time to track your progress! 💪 ✨",
            icon: "/favicon.svg",
            tag: reminder.id,
            requireInteraction: false,
          });

          // Close notification after 10 seconds
          setTimeout(() => notification.close(), 10000);

          // Only reschedule if it's a daily reminder (no date)
          if (!reminder.date) {
            const nextDayTimeout = setTimeout(
              () => scheduleNotification(reminder),
              24 * 60 * 60 * 1000
            );
            scheduledTimeouts.push(nextDayTimeout);
          }
        }
      }, msUntilTarget);

      scheduledTimeouts.push(timeoutId);
    };

    // Schedule all enabled reminders
    reminders.forEach((reminder) => {
      scheduleNotification(reminder);
    });

    // Cleanup function
    return () => {
      scheduledTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [reminders, notificationStatus]);
}

export default useLocalNotifications;
