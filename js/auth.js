/**
 * SkillPedia Authentication & User Session Manager
 * Enforces Mandatory Creator Authentication & Responsibility Audit Trail
 */

const SESSION_KEY = 'skillpedia_user_session';

class AuthManager {
  constructor() {
    this.currentUser = this.loadSession();
    this.pendingCreatorAction = null;
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
   * Enforces Mandatory Creator Authentication before building or editing skill reels.
   * If authenticated -> runs callback immediately.
   * If guest -> opens Creator Auth Modal and resumes callback upon sign-in.
   */
  requireCreatorAuth(onSuccess) {
    if (this.isAuthenticated()) {
      onSuccess(this.currentUser);
      return;
    }

    this.pendingCreatorAction = onSuccess;
    this.openAuthModal();
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
      company_name: companyName || 'Individual Creator',
      role: 'employer_creator',
      logged_in_at: new Date().toISOString()
    };

    this.currentUser = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.updateUI();
    this.closeAuthModal();

    if (typeof this.pendingCreatorAction === 'function') {
      const action = this.pendingCreatorAction;
      this.pendingCreatorAction = null;
      action(user);
    }

    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    this.updateUI();
  }

  updateUI() {
    const authBtn = document.getElementById('navAuthBtn');
    if (authBtn) {
      if (this.isAuthenticated()) {
        authBtn.innerHTML = `👤 ${this.currentUser.full_name}`;
        authBtn.onclick = () => this.showUserMenu();
      } else {
        authBtn.innerHTML = `🔐 Sign In (Creator Mode)`;
        authBtn.onclick = () => this.openAuthModal();
      }
    }
  }

  openAuthModal() {
    let modal = document.getElementById('creatorAuthModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'creatorAuthModal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal-card" style="max-width: 440px; padding: 24px; background: var(--bg-drawer); border: 1px solid var(--accent-cyan-border); border-radius: 20px; box-shadow: var(--shadow-card);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 36px; margin-bottom: 8px;">🔐</div>
            <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0 0 6px 0;">Creator Sign-In Required</h2>
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">Sign in to build custom AI skill packs or insert video reels. Creators are accountable for authored content.</p>
          </div>

          <form id="creatorAuthForm" onsubmit="event.preventDefault(); handleAuthSubmit();">
            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Creator Email Address *</label>
              <input type="email" id="authEmailInput" class="form-control" placeholder="your.name@company.com" required style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-primary); font-size: 14px;">
            </div>

            <div style="margin-bottom: 14px;">
              <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Full Name *</label>
              <input type="text" id="authNameInput" class="form-control" placeholder="e.g. Alex Morgan" required style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-primary); font-size: 14px;">
            </div>

            <div style="margin-bottom: 18px;">
              <label style="display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px;">Company / Organization (Optional)</label>
              <input type="text" id="authCompanyInput" class="form-control" placeholder="e.g. Acme Corp" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-primary); font-size: 14px;">
            </div>

            <div id="authModalError" style="display: none; color: #ef4444; font-size: 12px; margin-bottom: 14px; text-align: center;"></div>

            <button type="submit" class="btn-primary" style="width: 100%; padding: 12px; font-weight: 700; border-radius: 12px;">
              🚀 Sign In & Continue to Creator Studio
            </button>
          </form>

          <button onclick="authClient.closeAuthModal()" style="margin-top: 12px; width: 100%; background: transparent; border: none; color: var(--text-muted); font-size: 13px; cursor: pointer; text-decoration: underline;">
            Cancel & Return as Guest
          </button>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  closeAuthModal() {
    const modal = document.getElementById('creatorAuthModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  showUserMenu() {
    if (confirm(`Signed in as ${this.currentUser.full_name} (${this.currentUser.email}). Would you like to Sign Out?`)) {
      this.logout();
    }
  }
}

const authClient = new AuthManager();

function handleAuthSubmit() {
  const email = document.getElementById('authEmailInput')?.value;
  const name = document.getElementById('authNameInput')?.value;
  const company = document.getElementById('authCompanyInput')?.value;
  const errDiv = document.getElementById('authModalError');

  try {
    authClient.login(email, name, company);
  } catch (err) {
    if (errDiv) {
      errDiv.textContent = err.message;
      errDiv.style.display = 'block';
    }
  }
}
