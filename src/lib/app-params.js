export const appParams = {
  baseUrl: import.meta.env.VITE_APP_BASE_URL || window.location.origin,
  functionsRegion: import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1',
  useEmulators: import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true',
};

export default appParams;
