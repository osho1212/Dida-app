import { useCallback, useEffect, useMemo, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, getMessagingIfSupported } from "../firebase/client.js";

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const hasNotificationAPI = typeof window !== "undefined" && "Notification" in window;
const initialPermission = hasNotificationAPI ? window.Notification.permission : "default";

function useFirebaseMessaging(user) {
  const [permission, setPermission] = useState(initialPermission);
  const [tokenStatus, setTokenStatus] = useState("idle"); // idle | pending | success | error
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  const canUseMessaging = hasNotificationAPI;

  useEffect(() => {
    if (canUseMessaging) {
      setPermission(window.Notification.permission);
    } else {
      setPermission("default");
    }
  }, [canUseMessaging]);

  useEffect(() => {
    let unsubscribeForeground = () => {};
    if (!user || !canUseMessaging) return undefined;

    getMessagingIfSupported().then((messaging) => {
      if (!messaging) return;
      unsubscribeForeground = onMessage(messaging, (payload) => {
        setLastMessage({
          receivedAt: new Date().toISOString(),
          notification: payload.notification ?? null,
          data: payload.data ?? null
        });
      });
    });

    return () => unsubscribeForeground();
  }, [user, canUseMessaging]);

  const requestPermission = useCallback(async () => {
    if (!canUseMessaging) {
      setError(new Error("Notifications are not supported in this browser."));
      return null;
    }
    try {
      setTokenStatus("pending");
      const result = await window.Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        setTokenStatus("error");
        return null;
      }

      const messaging = await getMessagingIfSupported();
      if (!messaging) {
        setError(new Error("Firebase messaging not supported in this environment."));
        setTokenStatus("error");
        return null;
      }

      const token = await getToken(messaging, { vapidKey });

      if (user && token) {
        const tokenRef = doc(db, "users", user.uid, "notificationTokens", token);
        await setDoc(
          tokenRef,
          {
            token,
            platform: "web",
            grantedAt: serverTimestamp(),
            lastSeenAt: serverTimestamp()
          },
          { merge: true }
        );
      }

      setTokenStatus("success");
      return token;
    } catch (err) {
      setError(err);
      setTokenStatus("error");
      return null;
    }
  }, [canUseMessaging, user]);

  return {
    canUseMessaging,
    permission,
    tokenStatus,
    lastMessage,
    error,
    requestPermission
  };
}

export default useFirebaseMessaging;
