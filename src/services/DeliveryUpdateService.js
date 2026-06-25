import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit as limitFn, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const COLLECTION = 'delivery_updates';

export const list = async (sortBy = '-createdAt', maxLimit = 50) => {
  const direction = sortBy.startsWith('-') ? 'desc' : 'asc';
  const q = query(collection(db, COLLECTION), orderBy(sortBy.replace(/^-/, ''), direction), limitFn(maxLimit));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const filter = async (conditions, sortBy, maxLimit) => {
  let constraints = [];
  for (const [key, val] of Object.entries(conditions)) {
    if (val !== undefined && val !== null) constraints.push(where(key, '==', val));
  }
  if (sortBy) constraints.push(orderBy(sortBy.replace(/^-/, ''), sortBy.startsWith('-') ? 'desc' : 'asc'));
  if (maxLimit) constraints.push(limitFn(maxLimit));
  const snapshot = await getDocs(query(collection(db, COLLECTION), ...constraints));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const get = async (id) => {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const create = async (data) => {
  const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { id: ref.id, ...data };
};

export const update = async (id, data) => {
  await updateDoc(doc(db, COLLECTION, id), { ...data, updatedAt: serverTimestamp() });
  return get(id);
};

export const del = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
  return { id, success: true };
};

export const subscribe = (callback, options = {}) => {
  let constraints = [];
  if (options.where) {
    for (const [k, v] of Object.entries(options.where)) {
      if (v !== undefined && v !== null) constraints.push(where(k, '==', v));
    }
  }
  if (options.orderBy) {
    const dir = options.orderBy.startsWith('-') ? 'desc' : 'asc';
    constraints.push(orderBy(options.orderBy.replace(/^-/, ''), dir));
  }
  const q = query(collection(db, COLLECTION), ...constraints);
  return onSnapshot(q, (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};