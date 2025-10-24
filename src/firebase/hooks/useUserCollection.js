import { useEffect, useState, useRef } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";
import { db } from "../client.js";

function buildQuery(ref, options = {}) {
  let q = ref;
  if (options.orderByField) {
    q = query(q, orderBy(options.orderByField, options.orderDirection ?? "desc"));
  }
  if (options.limit) {
    q = query(q, limit(options.limit));
  }
  return q;
}

export default function useUserCollection(user, collectionName, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const optionsRef = useRef();

  // Serialize options to prevent unnecessary re-subscriptions
  const optionsKey = JSON.stringify({
    orderByField: options.orderByField,
    orderDirection: options.orderDirection,
    limit: options.limit
  });

  // Update ref only when serialized options change
  if (optionsRef.current !== optionsKey) {
    optionsRef.current = optionsKey;
  }

  useEffect(() => {
    if (!user) {
      setData([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const ref = collection(db, "users", user.uid, collectionName);
    const q = buildQuery(ref, options);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, collectionName, optionsRef.current]);

  return { data, loading, error };
}
