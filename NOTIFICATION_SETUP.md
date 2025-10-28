# 🔔 Dida Notification System Setup Guide

Complete guide to set up scheduled reminders for your Dida tracking app.

---

## ✅ What's Already Done

1. ✅ **Frontend UI** - Reminder management interface in Settings
2. ✅ **Firestore Sync** - Reminders stored in `users/{uid}/settings/reminders`
3. ✅ **Service Worker** - Background notification handler
4. ✅ **Cloud Function** - Automated notification scheduler
5. ✅ **Toggle Controls** - Enable/disable individual reminders

---

## 🚀 Setup Instructions

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase Project

```bash
cd /Users/girenderbharti/Desktop/dida
firebase init
```

**Select:**
- ☑️ Functions (Cloud Functions for Firebase)
- ☑️ Hosting (Firebase Hosting)

**Configuration:**
- Use existing project: `dida-app-f5216`
- Language: JavaScript
- ESLint: No
- Install dependencies: Yes
- Public directory: `dist`
- Single-page app: Yes
- Overwrite index.html: No

### Step 4: Install Function Dependencies

```bash
cd functions
npm install
cd ..
```

### Step 5: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This will deploy:
- `sendScheduledReminders` - Runs every minute to check and send reminders
- `testReminder` - HTTP endpoint to test notifications manually

### Step 6: Enable Cloud Scheduler API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `dida-app-f5216`
3. Search for "Cloud Scheduler API"
4. Click **Enable**

### Step 7: Set Timezone (Optional)

Edit `functions/index.js` line 13 to your timezone:

```javascript
timeZone: "America/New_York", // or "Europe/London", "Asia/Tokyo", etc.
```

Then redeploy:
```bash
firebase deploy --only functions
```

---

## 🧪 Testing Your Notifications

### Method 1: Wait for Scheduled Time
1. Open your app at your deployed URL
2. Go to **Settings → Reminder Rhythm**
3. Add a reminder for 2-3 minutes from now (e.g., if it's 10:23, set to 10:25)
4. Click **Enable Notifications** if not already enabled
5. Wait for the scheduled time
6. You should receive a notification!

### Method 2: Use Test Function (Immediate)

After deploying functions, you'll get a test URL like:
```
https://us-central1-dida-app-f5216.cloudfunctions.net/testReminder
```

**Test with curl:**
```bash
curl -X POST https://us-central1-dida-app-f5216.cloudfunctions.net/testReminder \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_USER_ID_HERE"}'
```

**Get your userId:**
1. Open browser DevTools (F12)
2. Go to Console
3. Type: `firebase.auth().currentUser.uid`
4. Copy the ID and use it in the curl command above

---

## 📱 How It Works

1. **User sets reminders** in Settings panel (e.g., 07:30 - Morning Glow)
2. **Reminders sync to Firestore** via `useUserReminders` hook
3. **Cloud Function runs every minute** checking current time
4. **Function queries all users** with enabled reminders matching current time
5. **Notifications sent** to all registered device tokens
6. **Service worker displays** notification even when app is closed

---

## 🎯 Reminder Data Structure

```javascript
// Stored in: users/{uid}/settings/reminders
{
  list: [
    {
      id: "reminder_1729784567890",
      time: "07:30",           // 24-hour format HH:MM
      label: "Morning Glow",
      enabled: true            // Toggle on/off
    },
    {
      id: "reminder_1729784567891",
      time: "13:00",
      label: "Midday Boost",
      enabled: false           // Disabled, won't trigger
    }
  ],
  updatedAt: Timestamp
}
```

---

## 🔧 Customization

### Change Notification Message

Edit `functions/index.js` line 84-90:

```javascript
const message = {
  notification: {
    title: reminder.label || "Dida Reminder",
    body: "Time to track your progress! 💪 ✨", // ← Change this
  },
  data: {
    type: "scheduled_reminder",
    reminderId: reminder.id,
    time: reminder.time,
  },
  tokens: tokens,
};
```

### Change Schedule Frequency

Edit `functions/index.js` line 13:

```javascript
schedule: "every 5 minutes",  // Check every 5 minutes instead of 1
```

**Note:** Less frequent checks = less precise timing but lower costs.

### Add Custom Reminder Categories

In `functions/index.js`, you can customize notifications based on reminder labels:

```javascript
// After line 75
let notificationBody = "Time to track your progress! 💪 ✨";

if (reminder.label.includes("Morning")) {
  notificationBody = "Rise and shine! Start your day strong! 🌅";
} else if (reminder.label.includes("Evening")) {
  notificationBody = "Time to wind down and log your day! 🌙";
}
```

---

## 💰 Cost Estimation

Firebase pricing for this setup:

- **Cloud Functions:** Free tier includes 2M invocations/month
  - Running every minute = ~44,000 invocations/month ✅ Free
- **Cloud Firestore:** Free tier includes 50K reads/day
  - Reminder checks use ~1-2 reads per user per minute
  - For 10 users: ~14,400 reads/day ✅ Free
- **Cloud Messaging:** Completely free, unlimited notifications ✅ Free

**Bottom line:** Should stay in free tier for personal use!

---

## 🐛 Troubleshooting

### Notifications Not Arriving

1. **Check notifications are enabled:**
   - Settings → Enable Notifications
   - Browser should show "Enabled" button

2. **Verify token is saved:**
   - Firebase Console → Firestore → users/{uid}/notificationTokens
   - Should have at least one document

3. **Check function logs:**
   ```bash
   firebase functions:log --only sendScheduledReminders
   ```

4. **Verify time format:**
   - Reminders must use 24-hour format: "07:30" not "7:30 AM"
   - Function checks exact string match

5. **Check timezone:**
   - Function timezone must match your local timezone
   - Edit `functions/index.js` line 13

### Function Deployment Fails

1. **Enable required APIs:**
   - Cloud Functions API
   - Cloud Scheduler API
   - Cloud Build API

2. **Check billing:**
   - Cloud Functions require Blaze (pay-as-you-go) plan
   - Still free within free tier limits

3. **Update Firebase CLI:**
   ```bash
   npm install -g firebase-tools@latest
   ```

### Service Worker Not Loading

1. **Check service worker registration:**
   - DevTools → Application → Service Workers
   - Should show "firebase-messaging-sw.js" as activated

2. **Clear cache and reload:**
   - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

3. **Check HTTPS:**
   - Service workers require HTTPS (or localhost)

---

## 📊 Monitoring

### View Function Logs

```bash
# Real-time logs
firebase functions:log --only sendScheduledReminders

# Last 10 entries
firebase functions:log --only sendScheduledReminders --lines 10
```

### Check Function Status

Firebase Console → Functions → Dashboard
- See invocation count
- Success/error rates
- Execution time

### Monitor Firestore Usage

Firebase Console → Firestore → Usage
- Read/write operations
- Storage size
- Active connections

---

## 🎨 Future Enhancements

Ideas to extend the notification system:

1. **Smart Reminders**
   - Send only if user hasn't tracked today
   - Adjust frequency based on user activity

2. **Reminder Templates**
   - Pre-built reminder sets (Morning Person, Night Owl, etc.)

3. **Snooze Feature**
   - "Remind me in 15 minutes" action

4. **Rich Notifications**
   - Add action buttons (Track Now, Dismiss)
   - Include quick stats in notification

5. **Multi-timezone Support**
   - Store user's timezone in Firestore
   - Calculate reminders per-user timezone

---

## 📚 Resources

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cloud Scheduler Docs](https://cloud.google.com/scheduler/docs)

---

## ✨ You're All Set!

Your notification system is ready to remind users to track their daily goals. Users can now:

- ✅ Set custom reminder times
- ✅ Toggle reminders on/off
- ✅ Receive notifications even when app is closed
- ✅ Manage multiple reminders for different times
- ✅ Edit/delete reminders anytime

Enjoy your automated reminder system! 🎉
