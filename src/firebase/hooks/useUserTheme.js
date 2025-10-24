import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../client.js";

const DEFAULT_THEME = "girly";
const STORAGE_KEY = "dida-preferred-theme";

function readLocalTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
  } catch (error) {
    // Access to storage might fail (e.g., privacy mode); fall back gracefully.
    return DEFAULT_THEME;
  }
}

function writeLocalTheme(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (error) {
    // Ignore storage errors – preference just won't persist locally.
  }
}

export default function useUserTheme(user) {
  const [theme, setTheme] = useState(() => readLocalTheme());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallbackTheme = readLocalTheme();
    if (!user || !db) {
      setTheme(fallbackTheme);
      setLoading(false);
      return () => {};
    }

    const prefRef = doc(db, "users", user.uid, "settings", "preferences");
    setLoading(true);

    const unsubscribe = onSnapshot(
      prefRef,
      (snapshot) => {
        const storedTheme = snapshot.exists() ? snapshot.data().theme : null;
        const resolvedTheme = storedTheme || fallbackTheme || DEFAULT_THEME;
        setTheme(resolvedTheme);
        writeLocalTheme(resolvedTheme);
        setLoading(false);
      },
      () => {
        setTheme(fallbackTheme);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateTheme = useCallback(
    async (value) => {
      const nextTheme = value || DEFAULT_THEME;
      setTheme(nextTheme);
      writeLocalTheme(nextTheme);

      if (user && db) {
        const prefRef = doc(db, "users", user.uid, "settings", "preferences");
        await setDoc(
          prefRef,
          {
            theme: nextTheme,
            themeUpdatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }
    },
    [user]
  );

  return useMemo(
    () => ({
      theme,
      loading,
      updateTheme
    }),
    [theme, loading, updateTheme]
  );
}
