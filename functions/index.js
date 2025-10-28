import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

initializeApp();

/**
 * Cloud Function that runs every minute to check and send scheduled reminders
 * Scheduled using Cloud Scheduler with timezone support
 */
export const sendScheduledReminders = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "Asia/Kolkata", // Change to your timezone
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async (event) => {
    const db = getFirestore();
    const messaging = getMessaging();

    try {
      // Get current time in HH:MM format
      const now = new Date();
      const currentTime = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata", // Match your timezone
      });

      console.log(`Checking reminders for time: ${currentTime}`);

      // Get all users
      const usersSnapshot = await db.collection("users").get();
      let totalNotificationsSent = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        // Get user's reminders
        const remindersDoc = await db
          .collection("users")
          .doc(userId)
          .collection("settings")
          .doc("reminders")
          .get();

        if (!remindersDoc.exists) {
          continue;
        }

        const reminders = remindersDoc.data().list || [];

        // Filter enabled reminders matching current time
        const activeReminders = reminders.filter(
          (reminder) => reminder.enabled && reminder.time === currentTime
        );

        if (activeReminders.length === 0) {
          continue;
        }

        // Get user's notification tokens
        const tokensSnapshot = await db
          .collection("users")
          .doc(userId)
          .collection("notificationTokens")
          .get();

        if (tokensSnapshot.empty) {
          console.log(`No tokens found for user ${userId}`);
          continue;
        }

        // Send notification to each token for each active reminder
        for (const reminder of activeReminders) {
          const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

          const message = {
            notification: {
              title: reminder.label || "Dida Reminder",
              body: "Time to track your progress! 💪 ✨",
            },
            data: {
              type: "scheduled_reminder",
              reminderId: reminder.id,
              time: reminder.time,
            },
            tokens: tokens,
          };

          try {
            const response = await messaging.sendEachForMulticast(message);
            totalNotificationsSent += response.successCount;

            console.log(
              `Sent "${reminder.label}" reminder to user ${userId}: ${response.successCount} success, ${response.failureCount} failures`
            );

            // Remove invalid tokens
            if (response.failureCount > 0) {
              const batch = db.batch();
              response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                  const tokenDoc = tokensSnapshot.docs[idx];
                  batch.delete(tokenDoc.ref);
                }
              });
              await batch.commit();
            }
          } catch (error) {
            console.error(
              `Error sending notification to user ${userId}:`,
              error
            );
          }
        }
      }

      console.log(
        `Reminder check completed. Sent ${totalNotificationsSent} notifications.`
      );

      return {
        success: true,
        time: currentTime,
        notificationsSent: totalNotificationsSent,
      };
    } catch (error) {
      console.error("Error in sendScheduledReminders:", error);
      throw error;
    }
  }
);

/**
 * Test function to manually trigger a reminder for a specific user
 * Useful for testing without waiting for scheduled time
 *
 * Usage: Call this HTTP function with userId in the request body
 */
import { onRequest } from "firebase-functions/v2/https";

export const testReminder = onRequest(async (req, res) => {
  const db = getFirestore();
  const messaging = getMessaging();

  try {
    const userId = req.body.userId || req.query.userId;

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    // Get user's notification tokens
    const tokensSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("notificationTokens")
      .get();

    if (tokensSnapshot.empty) {
      res.status(404).json({ error: "No notification tokens found for user" });
      return;
    }

    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

    const message = {
      notification: {
        title: "Test Reminder 🧪",
        body: "This is a test notification from Dida! Your reminders are working! ✨",
      },
      data: {
        type: "test_reminder",
        timestamp: new Date().toISOString(),
      },
      tokens: tokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      tokens: tokens.length,
    });
  } catch (error) {
    console.error("Error in testReminder:", error);
    res.status(500).json({ error: error.message });
  }
});
