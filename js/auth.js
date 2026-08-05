/**
 * SkillPedia Authentication & User Session Manager
 */

const SESSION_KEY = 'skillpedia_user_session';

class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
  }

  loadSession() {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getUser() {
    return this.currentUser;
  }

  /**
   * Login or Register an Employer/Creator
   */
  login(email, fullName, companyName = '') {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    const user = {
      id: `usr_${Date.now()}`,
      email: email.toLowerCase().trim(),
      full_name: fullName || email.split('@')[0],
      company_name: companyName,
      role: 'employer',
      logged_in_at: new Date().toISOString()
    };

    this.currentUser = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.updateUI();
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    this.updateUI();
  }

  updateUI() {
    const authBtn = document.getElementById('navAuthBtn');
    const authStatus = document.getElementById('userAuthStatus');
    
    if (authBtn) {
      if (this.isAuthenticated()) {
        authBtn.innerHTML = `👤 ${this.currentUser.full_name} (${this.currentUser.company_name || 'Employer'})`;
      } else {
        authBtn.innerHTML = `🔑 Employer Sign In`;
      }
    }

    if (authStatus) {
      if (this.isAuthenticated()) {
        authStatus.textContent = `Signed in as ${this.currentUser.email}`;
        authStatus.style.display = 'block';
      } else {
        authStatus.style.display = 'none';
      }
    }
  }
}

const authManager = new AuthManager();
