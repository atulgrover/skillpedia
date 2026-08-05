/**
 * SkillPedia Main Application Controller
 */

let activeSection = 'sectionNSQF';
let currentSectorFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initPWA();
  initTheme();
  sanitizeCachedCurricula();
  authManager.updateUI();
  handleUrlParameters();
  renderNSQFCatalogue();
  renderCustomCatalogue();
  setupEventListeners();
});

function sanitizeCachedCurricula() {
  const key = 'skillpedia_cached_curricula';
  const cached = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(cached) || cached.length === 0) return;

  let modified = false;
  const updated = cached.map(item => {
    const isCustom = item.type === 'custom_ai' || (item.id && item.id.startsWith('CUSTOM-')) || item.sector === 'Custom Micro-Learning';
    const isCargoTopic = (item.title || '').toLowerCase().includes('cargo') || (item.title || '').toLowerCase().includes('aircraft');

    if (isCustom && !isCargoTopic && Array.isArray(item.lessons)) {
      const topic = item.title || 'General';
      const verifiedPool = aiEngine.getVerifiedVideoPool(topic);
      item.lessons = item.lessons.map((les, idx) => {
        const correctVid = verifiedPool[idx % verifiedPool.length].video_id;
        if (les.video_id !== correctVid) {
          modified = true;
          return {
            ...les,
            video_id: correctVid
          };
        }
        return les;
      });
    }
    return item;
  });

  if (modified) {
    console.log('Sanitized all custom 11-reel video IDs in localStorage to match topic');
    localStorage.setItem(key, JSON.stringify(updated));
  }
}

/* PWA INSTALLATION & SERVICE WORKER */
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('SkillPedia Service Worker Registered:', reg.scope))
      .catch((err) => console.error('SW Registration Failed:', err));
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('pwaInstallBtn');
    const pwaBanner = document.getElementById('pwaBanner');
    if (installBtn) installBtn.style.display = 'flex';
    if (pwaBanner) pwaBanner.classList.remove('hidden');
  });
}

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User installed SkillPedia PWA');
      }
      deferredPrompt = null;
      closePWABanner();
    });
  }
}

function closePWABanner() {
  const pwaBanner = document.getElementById('pwaBanner');
  if (pwaBanner) pwaBanner.classList.add('hidden');
}

/* THEME TOGGLE */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem('theme', nextTheme);
  updateThemeIcon(nextTheme);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) btn.textContent = theme === 'light' ? '☀️' : '🌙';
}

/* SECTION SWITCHING */
function switchSection(sectionId, tabElem) {
  activeSection = sectionId;
  
  document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
  if (tabElem) tabElem.classList.add('active');

  document.querySelectorAll('.portal-section').forEach(sec => sec.classList.add('hidden'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove('hidden');

  if (sectionId === 'sectionAIGenerator') {
    renderCustomCatalogue();
  }
}

/* SECTOR FILTERING FOR NSQF TAB */
function filterBySector(sectorName, elem) {
  currentSectorFilter = sectorName;
  document.querySelectorAll('.sector-chip').forEach(chip => chip.classList.remove('active'));
  if (elem) elem.classList.add('active');

  const searchInput = document.getElementById('searchInput');
  const query = searchInput ? searchInput.value : '';
  renderNSQFCatalogue(query, currentSectorFilter);
}

/* RENDER NSQF CATALOGUE */
async function renderNSQFCatalogue(query = '', sector = currentSectorFilter) {
  const grid = document.getElementById('qpGrid');
  if (!grid) return;

  const qps = await dbClient.searchCurricula(query, sector);

  if (qps.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
        <h3>No Government Qualification Packs Found</h3>
        <p>Try searching for a different QP Code, Job Role, or changing the sector filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = qps.map(qp => `
    <div class="qp-card" onclick="openCurriculumReels('${qp.qp_code || qp.id}')">
      <div class="qp-card-header">
        <span class="qp-code-badge">${qp.qp_code || 'NSQF'} ${qp.version ? '• v' + qp.version : ''}</span>
        <span class="qp-level-tag">NSQF Level ${qp.nsqf_level || 3}</span>
      </div>

      <div>
        <h3 class="qp-title">${qp.title}</h3>
        <p class="qp-subtitle" style="margin-top: 6px;">${qp.subtitle || ''}</p>
        <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px; color: var(--text-secondary);">
            🏢 ${qp.sector || 'General'}
          </span>
          ${qp.pdf_url && qp.pdf_url !== '#' ? `
            <a href="${qp.pdf_url}" target="_blank" onclick="event.stopPropagation()" style="font-size: 11px; color: var(--accent-cyan); text-decoration: none;">
              📄 Govt Syllabus PDF ↗
            </a>
          ` : ''}
        </div>
      </div>

      <div class="qp-card-footer">
        <span class="lesson-meta">🎬 11 Standardized Reels</span>
        <span class="btn-open-reels">Explore Fixed Reels ➔</span>
      </div>
    </div>
  `).join('');
}

async function openCurriculumReels(idOrCode) {
  const curriculum = await dbClient.getCurriculumById(idOrCode);
  if (curriculum) {
    const formatted = formatStandardizedCurriculum(curriculum);
    reelViewer.loadReelPackage(formatted);
  }
}

/* SECTION 2: AI CUSTOM ON-THE-FLY 11-REEL GENERATOR */

/**
 * Preset chip clicked — exact skill name, skip confirmation, go straight to generation.
 */
function fillAndGeneratePrompt(promptText) {
  const input = document.getElementById('aiTopicInput');
  if (input) input.value = promptText;
  // Preset names are canonical — bypass LLM confirmation
  buildReelCurriculum(promptText);
}

/**
 * Phase 1: Form submitted — run LLM skill name inference, show confirmation card.
 * Falls back to direct generation if LLM unavailable.
 */
async function handleAIGenerate(e) {
  if (e) e.preventDefault();
  const input    = document.getElementById('aiTopicInput');
  const errorMsg = document.getElementById('aiErrorMsg');
  const btn      = document.getElementById('btnSubmitAI');

  if (!input || !input.value.trim()) return;

  const userText = input.value.trim();
  errorMsg.style.display = 'none';
  btn.disabled = true;
  btn.textContent = '🔍 Identifying Skill...';

  // Show inline thinking state in confirm card area
  showConfirmCardThinking(userText);

  try {
    const inference = await aiEngine.inferSkillName(userText);
    if (inference && inference.skill_name) {
      showSkillConfirmationCard(inference, userText);
    } else {
      // Fallback: LLM unavailable — generate directly
      buildReelCurriculum(userText);
    }
  } catch (_) {
    buildReelCurriculum(userText);
  } finally {
    btn.disabled = false;
    btn.textContent = '✨ Build Custom 11-Reel Skill Pack On-The-Fly';
  }
}

/**
 * Shows a subtle "thinking" state while LLM infers the skill.
 */
function showConfirmCardThinking(userText) {
  const card = document.getElementById('skillConfirmCard');
  if (!card) return;
  card.innerHTML = `
    <div class="skill-confirm-thinking">
      <span class="skill-confirm-spinner"></span>
      <span>Identifying best skill match for "<em>${userText}</em>"...</span>
    </div>
  `;
  card.classList.remove('hidden');
}

/**
 * Phase 1 result: Renders the skill name confirmation card.
 */
function showSkillConfirmationCard(inference, originalText) {
  const card = document.getElementById('skillConfirmCard');
  if (!card) {
    // No card DOM — fall back directly
    buildReelCurriculum(inference.skill_name);
    return;
  }

  const isLowConfidence = inference.confidence === 'low';

  card.innerHTML = `
    <div class="skill-confirm-card">
      <div class="skill-confirm-header">
        <span class="skill-confirm-label">🤖 AI Skill Interpreter</span>
        ${isLowConfidence
          ? `<span class="skill-confirm-badge low">⚠️ Low Confidence</span>`
          : `<span class="skill-confirm-badge high">✅ Matched</span>`
        }
      </div>

      <p class="skill-confirm-prompt">We matched your request to:</p>

      <div class="skill-confirm-result">
        <span class="skill-confirm-emoji">${inference.emoji || '🎯'}</span>
        <div>
          <div class="skill-confirm-name">${inference.skill_name}</div>
          <div class="skill-confirm-sector">${inference.sector || 'Vocational Training'}</div>
        </div>
      </div>

      ${isLowConfidence
        ? `<p class="skill-confirm-warning">⚠️ Low confidence — please review the skill name before confirming.</p>`
        : `<p class="skill-confirm-reason">${inference.reason || ''}</p>`
      }

      <div class="skill-confirm-actions">
        <button class="btn-primary" onclick="confirmAndGenerate('${inference.skill_name.replace(/'/g, "\\'")}')"
          style="flex: 1;">
          ✅ Yes, Build 11 Reels
        </button>
        <button class="btn-secondary" onclick="editSkillName('${inference.skill_name.replace(/'/g, "\\'")}')"
          style="flex: 1;">
          ✏️ Edit Name
        </button>
      </div>
    </div>
  `;
  card.classList.remove('hidden');
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** User confirmed — proceed to Phase 2 generation. */
function confirmAndGenerate(skillName) {
  const card = document.getElementById('skillConfirmCard');
  if (card) card.classList.add('hidden');
  buildReelCurriculum(skillName);
}

/** User wants to edit — pre-fill input with suggested name. */
function editSkillName(suggestedName) {
  const card  = document.getElementById('skillConfirmCard');
  const input = document.getElementById('aiTopicInput');
  if (card)  card.classList.add('hidden');
  if (input) {
    input.value = suggestedName;
    input.focus();
    input.select();
  }
}

/**
 * Phase 2: Generate the 11-reel curriculum for a confirmed skill name.
 */
async function buildReelCurriculum(topicText) {
  const resultContainer = document.getElementById('aiGenerateResult');
  const errorMsg        = document.getElementById('aiErrorMsg');
  const btn             = document.getElementById('btnSubmitAI');
  const card            = document.getElementById('skillConfirmCard');

  if (card) card.classList.add('hidden');
  errorMsg.style.display = 'none';
  btn.disabled = true;

  const updateProgressUI = (stepNum, message, percent) => {
    resultContainer.innerHTML = `
      <div class="ai-progress-card" style="margin-top: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 13px; font-weight: 700; color: #c084fc;">
            Phase ${stepNum} of 4: ${message}
          </span>
          <span style="font-size: 12px; font-weight: 800; color: var(--accent-cyan);">${percent}%</span>
        </div>
        <div class="ai-progress-bar">
          <div class="ai-progress-fill" style="width: ${percent}%;"></div>
        </div>
        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
          Synthesizing 11-step learning path for "<strong>${topicText}</strong>"...
        </p>
      </div>
    `;
  };

  try {
    const curriculum = await aiEngine.generate11ReelCurriculum(topicText, updateProgressUI);
    const formatted  = formatStandardizedCurriculum(curriculum);

    resultContainer.innerHTML = `
      <div class="hero-search-card card-highlight-pulse" style="margin-top: 16px; border-color: var(--accent-cyan-border);">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span class="badge-ai-custom">✨ On-The-Fly Skill Pack Created</span>
          <span class="badge-llm-powered">11 Video Reels Matched</span>
        </div>
        <h3 style="margin-top: 10px; font-size: 20px; color: var(--text-primary);">🎉 ${formatted.title}</h3>
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">${formatted.subtitle}</p>
        <button class="btn-primary" style="margin-top: 14px; width: 100%;"
          onclick="window.open('https://skillpedia.pages.dev/reel.html?qp=${formatted.id}', '_blank')">
          🎬 Watch Custom 11-Reel Course (TikTok View) ↗
        </button>
      </div>
    `;
    reelViewer.loadReelPackage(formatted);
    renderCustomCatalogue();

    const customGrid = document.getElementById('customQpGrid');
    if (customGrid) customGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (err) {
    errorMsg.textContent = `⚠️ ${err.message}`;
    errorMsg.style.display = 'block';
    resultContainer.innerHTML = '';
  } finally {
    btn.disabled = false;
  }
}

/* RENDER CUSTOM SKILL PACKS CATALOGUE */
async function renderCustomCatalogue() {
  const grid = document.getElementById('customQpGrid');
  const countBadge = document.getElementById('customCountBadge');
  if (!grid) return;

  const customPacks = await dbClient.searchCurricula('', '', 'custom_ai');

  if (countBadge) {
    countBadge.textContent = `${customPacks.length} Pack${customPacks.length === 1 ? '' : 's'}`;
  }

  if (customPacks.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-muted); background: var(--bg-card); border-radius: 16px; border: 1px dashed var(--border-subtle);">
        <h3>No Custom Skill Packs Created Yet</h3>
        <p style="font-size: 13px; margin-top: 4px;">Enter a topic above or click an instant preset to synthesize your first on-the-fly 11-reel course.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = customPacks.map(qp => {
    const safeTitle = (qp.title || 'Custom Skill').replace(/'/g, "\\'");
    return `
      <div class="qp-card" onclick="openCurriculumReels('${qp.id || qp.qp_code}')" style="border-color: rgba(168, 85, 247, 0.35); position: relative;">
        <div class="qp-card-header" style="display: flex; align-items: center; justify-content: space-between;">
          <span class="badge-ai-custom">✨ ON-THE-FLY</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn-secondary" onclick="copyCustomSkillUrl('${qp.id}', event)" style="font-size: 11px; padding: 3px 8px; background: var(--accent-cyan-bg); border: 1px solid var(--accent-cyan-border); color: var(--accent-cyan); border-radius: 6px; font-weight: 700; cursor: pointer;">
              🔗 URL-Link
            </button>
            <button class="btn-delete-skill" onclick="deleteCustomSkill('${qp.id}', '${safeTitle}', event)" title="Delete Skill Pack">
              🗑️
            </button>
          </div>
        </div>

        <div style="margin-top: 10px;">
          <h3 class="qp-title">${qp.title}</h3>
          <p class="qp-subtitle" style="margin-top: 6px;">${qp.subtitle || ''}</p>
        </div>

        <div class="qp-card-footer" style="margin-top: 14px; display: flex; align-items: center; justify-content: space-between;">
          <span class="lesson-meta" style="color: #c084fc;">🤖 11 AI Reels</span>
          <span class="btn-open-reels">Play Course ➔</span>
        </div>
      </div>
    `;
  }).join('');
}

function copyCustomSkillUrl(id, event) {
  if (event) event.stopPropagation();
  const url = `https://skillpedia.pages.dev/reel.html?qp=${id}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    alert(`🔗 Course Link Copied to Clipboard!\n\n${url}`);
  } else {
    alert(`🔗 Course URL:\n${url}`);
  }
}

async function deleteCustomSkill(id, title, event) {
  if (event) event.stopPropagation();

  if (confirm(`🗑️ Delete Skill Pack?\n\nAre you sure you want to delete "${title || 'this custom skill pack'}"?\n\nThis will remove the 11-reel curriculum and clear all saved lesson progress memory.`)) {
    await dbClient.deleteCurriculum(id);

    // If currently open in inspector player, close player
    if (reelViewer.currentCurriculum && reelViewer.currentCurriculum.id === id) {
      const sideInspector = document.getElementById('sideInspector');
      if (sideInspector) sideInspector.classList.add('hidden');
    }

    renderCustomCatalogue();
  }
}

async function clearAllCustomSkills() {
  if (confirm('🗑️ Clear All Custom Skill Packs?\n\nAre you sure you want to delete ALL generated custom skill packs from storage?')) {
    const cached = JSON.parse(localStorage.getItem('skillpedia_cached_curricula') || '[]');
    const officialGovOnly = cached.filter(c => c.type !== 'custom_ai' && (!c.id || !c.id.startsWith('CUSTOM-')) && c.sector !== 'Custom Micro-Learning');
    localStorage.setItem('skillpedia_cached_curricula', JSON.stringify(officialGovOnly));

    const sideInspector = document.getElementById('sideInspector');
    if (sideInspector) sideInspector.classList.add('hidden');

    renderCustomCatalogue();
  }
}

/* SECTION 3: EMPLOYER REQUEST PORTAL */
async function handleEmployerCreate(e) {
  e.preventDefault();
  
  if (!authManager.isAuthenticated()) {
    openAuthModal();
    return;
  }

  const company = document.getElementById('empCompanyInput').value.trim();
  const role = document.getElementById('empRoleInput').value.trim();
  const selectCurr = document.getElementById('empCurriculumSelect').value;
  const note = document.getElementById('empNoteInput').value.trim();

  if (!company || !selectCurr) {
    alert('Please enter your Company Name and select a Curriculum.');
    return;
  }

  const shareCode = `${company.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
  const pkg = {
    package_id: `pkg_${Date.now()}`,
    employer_id: authManager.getUser().id,
    company_name: company,
    target_role: role,
    curriculum_id: selectCurr,
    instructor_note: note,
    share_code: shareCode,
    created_at: new Date().toISOString()
  };

  await dbClient.createEmployerPackage(pkg);
  showShareModal(pkg);
}

function showShareModal(pkg) {
  const modal = document.getElementById('shareModal');
  const urlInput = document.getElementById('shareUrlInput');
  const qrBox = document.getElementById('qrCodeBox');

  const shareUrl = `${window.location.origin}${window.location.pathname}?pack=${pkg.share_code}`;
  urlInput.value = shareUrl;

  qrBox.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}" alt="QR Code">`;
  modal.classList.remove('hidden');
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.classList.add('hidden');
}

function copyShareUrl() {
  const input = document.getElementById('shareUrlInput');
  if (input) {
    input.select();
    navigator.clipboard.writeText(input.value);
    alert('📋 Shareable URL copied to clipboard! Share this link with your employees.');
  }
}

/* AUTH MODAL HANDLERS */
function openAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('hidden');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('hidden');
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value;
  const name = document.getElementById('authName').value;
  const company = document.getElementById('authCompany').value;

  try {
    authManager.login(email, name, company);
    closeAuthModal();
    alert(`Welcome ${name || email}! You are now signed in as an Employer.`);
  } catch (err) {
    alert(err.message);
  }
}

/* URL PARAMETER DEEP-LINK PARSER */
async function handleUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  
  if (!params.has('qp') && !params.has('pack')) return;

  // Show fullscreen learner modal — works on ALL screen sizes including mobile
  const modal = document.getElementById('learnerModal');
  const modalContent = document.getElementById('learnerModalContent');
  if (!modal || !modalContent) return;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Show a loading state immediately
  modalContent.innerHTML = `
    <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
      <div style="font-size: 36px; margin-bottom: 16px;">⏳</div>
      <p style="font-size: 14px; font-weight: 600;">Loading Skill Course...</p>
    </div>
  `;

  if (params.has('qp')) {
    const qpId = params.get('qp');
    const curr = await dbClient.getCurriculumById(qpId);
    if (curr) {
      reelViewer.loadReelPackageInto(formatStandardizedCurriculum(curr), modalContent);
    } else {
      modalContent.innerHTML = `<div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
        <div style="font-size: 36px; margin-bottom: 12px;">😕</div>
        <p>Course not found. <a href="/" style="color: var(--accent-cyan);">Browse all skills →</a></p>
      </div>`;
    }
  } else if (params.has('pack')) {
    const packCode = params.get('pack');
    const pkg = await dbClient.getEmployerPackage(packCode);
    if (pkg) {
      const curr = await dbClient.getCurriculumById(pkg.curriculum_id);
      if (curr) {
        reelViewer.loadReelPackageInto(formatStandardizedCurriculum(curr), modalContent, {
          company_name: pkg.company_name,
          target_role: pkg.target_role,
          instructor_note: pkg.instructor_note
        });
      }
    }
  }
}

function closeLearnerModal() {
  const modal = document.getElementById('learnerModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  window.history.pushState({}, '', window.location.pathname);
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderNSQFCatalogue(e.target.value);
    });
  }

  const aiForm = document.getElementById('aiGenerateForm');
  if (aiForm) {
    aiForm.addEventListener('submit', handleAIGenerate);
  }

  const empForm = document.getElementById('employerForm');
  if (empForm) {
    empForm.addEventListener('submit', handleEmployerCreate);
  }

  const authForm = document.getElementById('authForm');
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
  }
}
