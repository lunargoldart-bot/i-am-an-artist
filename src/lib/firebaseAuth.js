import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';

const googleProvider = new GoogleAuthProvider();

const defaultProfile = (firebaseUser) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || '',
  full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Artist',
  profile_image: firebaseUser.photoURL || '',
  role: 'user',
  subscription_tier: 'free',
});

export const hydrateUser = async (firebaseUser) => {
  if (!firebaseUser) return null;
  const userRef = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  const base = defaultProfile(firebaseUser);

  if (!snapshot.exists()) {
    const now = new Date().toISOString();
    await setDoc(userRef, { ...base, created_date: now, updated_date: now }, { merge: true });
    return { id: firebaseUser.uid, ...base, created_date: now, updated_date: now };
  }

  return {
    id: firebaseUser.uid,
    ...base,
    ...snapshot.data(),
    uid: firebaseUser.uid,
    email: snapshot.data().email || firebaseUser.email || '',
  };
};

export const getCurrentUser = async () => hydrateUser(auth.currentUser);
export const isUserAuthenticated = () => Boolean(auth.currentUser);

let nativeGoogleReady = false;

async function ensureNativeGoogle() {
  const { Capacitor } = await import('@capacitor/core');
  if (!Capacitor.isNativePlatform()) return null;
  const { SocialLogin } = await import('@capgo/capacitor-social-login');
  if (!nativeGoogleReady) {
    await SocialLogin.initialize({
      google: {
        webClientId: import.meta.env.VITE_FIREBASE_WEB_CLIENT_ID,
        mode: 'online',
      },
    });
    nativeGoogleReady = true;
  }
  return SocialLogin;
}

export const signInWithGoogle = async () => {
  const SocialLogin = await ensureNativeGoogle();
  if (SocialLogin) {
    const { result } = await SocialLogin.login({ provider: 'google', options: { scopes: ['email', 'profile'] } });
    if (!result?.idToken) throw new Error('Google Sign-In did not return an ID token');
    const credential = GoogleAuthProvider.credential(result.idToken);
    const firebaseUser = (await signInWithCredential(auth, credential)).user;
    return hydrateUser(firebaseUser);
  }
  const result = await signInWithPopup(auth, googleProvider);
  return hydrateUser(result.user);
};

export const signInWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return hydrateUser(result.user);
};

export const registerWithEmail = async (email, password, fullName = '') => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (fullName) await updateProfile(result.user, { displayName: fullName });
  return hydrateUser(result.user);
};

export const logoutUser = async () => signOut(auth);

// ─── Password recovery ─────────────────────────────────────────────────
// Sends Firebase's secure password-reset email. Uses a non-revealing
// response so callers never learn whether an account exists.
export const sendPasswordReset = async (email, actionCodeSettings) => {
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
    throw new Error('Please enter a valid email address.');
  }
  const settings = actionCodeSettings || {
    url: `${typeof window !== 'undefined' ? window.location.origin : 'https://www.iamanartistapp.com'}/reset-password`,
    handleCodeInApp: false,
  };
  await sendPasswordResetEmail(auth, email.trim(), settings);
};

// Completes a reset initiated from the email link. `oobCode` is the code
// in the reset email URL (?mode=resetPassword&oobCode=...).
export const completePasswordReset = async (oobCode, newPassword) => {
  if (!oobCode) throw new Error('This password reset link is invalid or has expired.');
  await confirmPasswordReset(auth, oobCode, newPassword);
};

// ─── Account management ────────────────────────────────────────────────
// Changes the signed-in user's password after re-authentication.
export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user?.email) throw new Error('This account uses a provider login and does not have a password to change.');
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

export const onAuthChange = (callback) => onAuthStateChanged(auth, async (firebaseUser) => {
  try {
    callback(await hydrateUser(firebaseUser));
  } catch (error) {
    console.error('Failed to load user profile:', error);
    callback(firebaseUser ? { id: firebaseUser.uid, ...defaultProfile(firebaseUser) } : null, error);
  }
});

export const updateUserProfile = async (data) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const authUpdates = {};
  const nextDisplayName = data.full_name ?? data.displayName;
  const nextPhotoURL = data.profile_image ?? data.photoURL;
  if (nextDisplayName !== undefined) authUpdates.displayName = nextDisplayName;
  if (nextPhotoURL !== undefined) authUpdates.photoURL = nextPhotoURL;
  if (Object.keys(authUpdates).length) await updateProfile(auth.currentUser, authUpdates);

  const payload = {
    ...data,
    uid: auth.currentUser.uid,
    email: auth.currentUser.email || data.email || '',
    updated_date: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', auth.currentUser.uid), payload, { merge: true });
  return hydrateUser(auth.currentUser);
};
