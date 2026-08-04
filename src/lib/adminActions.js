import { doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

const now = () => new Date().toISOString();

export const updateRecord = async (collection, id, data) => {
  await updateDoc(doc(db, collection, id), { ...data, updated_date: now() });
  return { id, ...data };
};

export const deleteRecord = async (collection, id) => {
  await deleteDoc(doc(db, collection, id));
  return { id, success: true };
};

export const upsertRecord = async (collection, id, data) => {
  const ref = doc(db, collection, id);
  const payload = { ...data, updated_date: now() };
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) payload.created_date = data.created_date || now();
  await setDoc(ref, payload, { merge: true });
  return { id, ...payload };
};

export const withToast = (promise, success = 'Done') => toast.promise(promise, {
  loading: 'Working…',
  success,
  error: (err) => err?.message || 'Action failed',
});