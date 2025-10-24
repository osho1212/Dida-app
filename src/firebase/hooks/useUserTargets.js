import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../client.js";
import { DEFAULT_TARGETS, mergeTargets } from "../../constants/defaultTargets.js";

function normaliseTargets(payload) {
  if (!payload) return DEFAULT_TARGETS;
  const numericFields = [
    "fitnessDailyExercises",
    "calorieDailyGoal",
    "expenseDailyBudget",
    "expenseMonthlyBudget",
    "todoDailyTarget"
  ];

  const normalised = { ...payload };
  numericFields.forEach((field) => {
    if (normalised[field] !== undefined) {
      const value = Number(normalised[field]);
      if (Number.isFinite(value) && value > 0) {
        normalised[field] = value;
      } else {
        delete normalised[field];
      }
    }
  });

  return mergeTargets(normalised);
}

export default function useUserTargets(user) {
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setTargets(DEFAULT_TARGETS);
      setLoading(false);
      return () => {};
    }

    const ref = doc(db, "users", user.uid, "settings", "targets");
    setLoading(true);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setTargets(normaliseTargets(snapshot.data()));
        } else {
          setTargets(DEFAULT_TARGETS);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setTargets(DEFAULT_TARGETS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateTargets = useCallback(
    async (partial) => {
      if (!user) return;
      const ref = doc(db, "users", user.uid, "settings", "targets");
      const payload = {};
      Object.entries(partial).forEach(([key, value]) => {
        const numeric = Number(value);
        if (Number.isFinite(numeric) && numeric > 0) {
          payload[key] = numeric;
        }
      });
      if (Object.keys(payload).length === 0) {
        return;
      }

      // Optimistic local update so UI reflects immediately
      setTargets((prev) => mergeTargets({ ...prev, ...payload }));

      await setDoc(
        ref,
        {
          ...payload,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    },
    [user]
  );

  return useMemo(
    () => ({
      targets,
      loading,
      error,
      updateTargets
    }),
    [targets, loading, error, updateTargets]
  );
}
