import {
  getCurrentUser,
  isUserAuthenticated,
  logoutUser,
  updateUserProfile,
} from '@/lib/firebaseAuth';

const authService = {
  getCurrentUser,
  isAuthenticated: async () => isUserAuthenticated(),
  logout: logoutUser,
  redirectToLogin(returnUrl = window.location.href) {
    sessionStorage.setItem('artist_login_redirect', returnUrl);
    window.location.assign('/login');
  },
  updateUserProfile,
};

export default authService;
