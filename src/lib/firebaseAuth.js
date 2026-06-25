import { 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';

import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from './firebase.js';

/**
 * Helper function to wait for auth state to change
 * Returns a promise that resolves with the current user
 * Waits for onAuthStateChanged to fire before resolving
 */
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Check if user is authenticated
 * Returns true if auth.currentUser is not null
 */
export const isUserAuthenticated = () => {
  return auth.currentUser !== null;
};

/**
 * Sign in with Google
 * Uses GoogleAuthProvider and signInWithPopup
 */
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 * Uses signInWithEmailAndPassword
 */
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

/**
 * Logout user
 * Uses signOut and redirects to '/'
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    window.location.href = '/';
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Listen to auth state changes
 * Returns unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Update user profile
 * Updates both Firebase Auth profile and Firestore user document
 */
export const updateUserProfile = async (data) => {
  try {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    // Update Firebase Auth profile
    const authUpdates = {};
    if (data.displayName) {
      authUpdates.displayName = data.displayName;
    }
    if (data.photoURL) {
      authUpdates.photoURL = data.photoURL;
    }

    if (Object.keys(authUpdates).length > 0) {
      await updateProfile(auth.currentUser, authUpdates);
    }

    // Update Firestore user document
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userDocRef);

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (userDoc.exists()) {
      await updateDoc(userDocRef, updateData);
    } else {
      await setDoc(userDocRef, {
        ...updateData,
        createdAt: new Date().toISOString(),
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        role: 'user'
      });
    }

    // Return updated user
    return {
      ...auth.currentUser,
      ...updateData
    };
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

// Export the auth instance for direct access
export { auth };