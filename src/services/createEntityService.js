import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit as limitFn,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

const asRecord = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

const buildConstraints = (conditions = {}, sortBy, maxLimit) => {
  const constraints = [];
  for (const [key, value] of Object.entries(conditions || {})) {
    if (value === undefined || value === null || value === '') continue;
    constraints.push(where(key === 'id' ? documentId() : key, '==', value));
  }
  if (sortBy) {
    const direction = sortBy.startsWith('-') ? 'desc' : 'asc';
    constraints.push(orderBy(sortBy.replace(/^-/, ''), direction));
  }
  if (Number.isFinite(Number(maxLimit)) && Number(maxLimit) > 0) {
    constraints.push(limitFn(Number(maxLimit)));
  }
  return constraints;
};

export const createEntityService = (collectionName) => {
  const getRecord = async (id) => {
    if (!id) return null;
    const snapshot = await getDoc(doc(db, collectionName, id));
    return snapshot.exists() ? asRecord(snapshot) : null;
  };

  return ({
  async list(sortBy, maxLimit = 100) {
    const snapshot = await getDocs(query(collection(db, collectionName), ...buildConstraints({}, sortBy, maxLimit)));
    return snapshot.docs.map(asRecord);
  },

  async filter(conditions = {}, sortBy, maxLimit = 100) {
    const snapshot = await getDocs(query(collection(db, collectionName), ...buildConstraints(conditions, sortBy, maxLimit)));
    return snapshot.docs.map(asRecord);
  },

  get: getRecord,

  async create(data = {}) {
    const now = new Date().toISOString();
    const payload = {
      ...data,
      created_date: data.created_date || now,
      updated_date: now,
    };
    const reference = await addDoc(collection(db, collectionName), payload);
    return { id: reference.id, ...payload };
  },

  async update(id, data = {}) {
    const payload = { ...data, updated_date: new Date().toISOString() };
    await updateDoc(doc(db, collectionName, id), payload);
    return getRecord(id);
  },

  async del(id) {
    await deleteDoc(doc(db, collectionName, id));
    return { id, success: true };
  },

  subscribe(callback, options = {}) {
    const constraints = buildConstraints(options.where || {}, options.orderBy, options.limit);
    let initialized = false;
    return onSnapshot(query(collection(db, collectionName), ...constraints), (snapshot) => {
      if (!initialized) {
        initialized = true;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        const typeMap = { added: 'create', modified: 'update', removed: 'delete' };
        callback({ type: typeMap[change.type], data: asRecord(change.doc) });
      });
    }, (error) => callback({ type: 'error', error }));
  },
  });
};
