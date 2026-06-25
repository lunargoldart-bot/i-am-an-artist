const { firebaseService } = require('../lib/firebase');

class AuthService {
  async getCurrentUser() {
    return firebaseService.auth.getCurrentUser();
  }

  async isAuthenticated() {
    return firebaseService.auth.isAuthenticated();
  }

  async logout() {
    return firebaseService.auth.logout();
  }

  redirectToLogin(returnUrl = window.location.pathname) {
    firebaseService.auth.redirectToLogin(returnUrl);
  }

  async updateUserProfile(data) {
    return firebaseService.auth.updateUserProfile(data);
  }
}

module.exports = new AuthService();