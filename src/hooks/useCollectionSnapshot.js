import { useCallback, useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, limit, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Realtime Firestore collection snapshot hook.
 * Fetches documents and keeps them in sync as they change.
 *
 * @param {string} name Collection name.
 * @param {object} options - { orderByField, direction, max, where: [ [field, op, value], ... ] }
 */
export function useCollectionSnapshot(name, options = {}) {
  const { orderByField, direction = 'desc', max = 1000, where: whereClauses } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!name) {
      setData([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError(null);

    const constraints = [];
    (whereClauses || []).forEach(([field, op, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        constraints.push(where(field, op, value));
      }
    });
    if (orderByField) constraints.push(orderBy(orderByField, direction));
    if (Number.isFinite(Number(max)) && Number(max) > 0) constraints.push(limit(Number(max)));
    const q = query(collection(db, name), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [name, orderByField, direction, max, JSON.stringify(whereClauses), attempt]);

  const refresh = useCallback(() => setAttempt((prev) => prev + 1), []);

  return useMemo(() => ({ data, loading, error, refresh }), [data, loading, error, refresh]);
}