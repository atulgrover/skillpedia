/**
 * SkillPedia Main Application Controller (Ultra-Simple Unified UX)
 */

let currentSectorFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c[APP] ========== DOMContentLoaded START ==========', 'color: #22d3ee; font-weight: bold; font-size: 14px');
  initPWA();
  initTheme();
  sanitizeCachedCurricula();
  handleUrlParameters();
  renderUnifiedCatalogue();
  setupUniversalSearch();
  console.log('%c[APP] ========== DOMContentLoaded COMPLETE ==========', 'color: #22d3ee; font-weight: bold; font-size: 14px');
});

function sanitizeCachedCurricula() {
  console.log('%c[APP] sanitizeCachedCurricula() START', 'color: #f97316; font-weight: bold; font-size: 13px');
  const key = 'skillpedia_cached_curricula';
  const cached = JSON.parse(localStorage.getItem(key) || '[]');
  console.log(`[APP] sanitizeCachedCurricula: Found ${cached.length} cached items in localStorage`);
  if (!Array.isArray(cached) || cached.length === 0) {
    console.log('[APP] sanitizeCachedCurricula: Empty cache, nothing to sanitize');
    return;
  }

  let modified = false;
  const updated = cached.map(item => {
    const isCustom = item.type === 'custom_ai' || (item.id && item.id.startsWith('CUSTOM-')) || item.sector === 'Custom Micro-Learning';
    const isCargoTopic = (item.title || '').toLowerCase().includes('cargo') || (item.title || '').toLowerCase().includes('aircraft');

    console.log(`[APP] sanitize item: id="${item.id}" title="${item.title}" isCustom=${isCustom} isCargoTopic=${isCargoTopic}`);

    if (isCustom && !isCargoTopic && Array.isArray(item.lessons)) {
      const topic = item.title || 'General';
      console.log(`  [APP] ⚠️ SANITIZING custom skill "${topic}" — calling getVerifiedVideoPool...`);
      const verifiedPool = aiEngine.getVerifiedVideoPool(topic);
      console.log(`  [APP] getVerifiedVideoPool returned ${verifiedPool.length} videos, first="${verifiedPool[0]?.video_id}"`);

      item.lessons = item.lessons.map((les, idx) => {
        const correctVid = verifiedPool[idx % verifiedPool.length].video_id;
        const currentVid = les.video_id;
        if (currentVid !== correctVid) {
          console.warn(`  [APP] ⚠️ REWRITING lesson[${idx}] video_id: "${currentVid}" → "${correctVid}" (FORCED by sanitizer)`);
          modified = true;
          return {
            ...les,
            video_id: correctVid
          };
        }
        console.log(`  [APP] lesson[${idx}] video_id "${currentVid}" already correct ✅`);
        return les;
      });
    }
    return item;
  });

  if (modified) {
    console.warn(`%c[APP] sanitizeCachedCurricula: ⚠️ MODIFIED localStorage — saving updated cache`, 'color: #ef4444; font-weight: bold');
    localStorage.setItem(key, JSON.stringify(updated));
  } else {
    console.log('[APP] sanitizeCachedCurricula: No modifications needed ✅');
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
    if (installBtn) installBtn.style.display = 'flex';
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
    });
  }
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

/* UNIVERSAL SEARCH & SECTOR FILTERING */
function setupUniversalSearch() {
  const input = document.getElementById('universalSearchInput');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    renderUnifiedCatalogue(query, currentSectorFilter);
  });
}

function filterBySector(sectorName, elem) {
  currentSectorFilter = sectorName;
  document.querySelectorAll('.sector-chip').forEach(chip => chip.classList.remove('active'));
  if (elem) elem.classList.add('active');

  const input = document.getElementById('universalSearchInput');
  const query = input ? input.value.trim() : '';
  renderUnifiedCatalogue(query, currentSectorFilter);
}

function fillAndSearch(text) {
  const input = document.getElementById('universalSearchInput');
  if (input) {
    input.value = text;
    renderUnifiedCatalogue(text, currentSectorFilter);
  }
}

/* UNIFIED CATALOGUE RENDERER (OFFICIAL + CUSTOM IN ONE GRID) */
async function renderUnifiedCatalogue(query = '', sector = currentSectorFilter) {
  const grid = document.getElementById('unifiedGrid');
  const badge = document.getElementById('skillCountBadge');
  const aiBanner = document.getElementById('aiBuildBanner');
  const newTopicTitle = document.getElementById('newTopicTitle');
  if (!grid) return;

  // 1. Fetch Official NSQF & Custom AI skills from DB
  const officialList = await dbClient.searchCurricula(query, sector, 'nsqf_official');
  const customList = await dbClient.searchCurricula(query, sector, 'custom_ai');

  let allSkills = [];
  if (sector === 'custom_ai') {
    allSkills = customList;
  } else {
    allSkills = [...officialList, ...customList];
  }

  if (badge) {
    badge.textContent = `${allSkills.length} Course${allSkills.length === 1 ? '' : 's'}`;
  }

  // 2. Check if query is typed and suggest 1-click build banner if no exact match
  const cleanQuery = query.trim().toLowerCase();
  const exactMatchFound = allSkills.some(s => (s.title || '').toLowerCase() === cleanQuery);

  if (aiBanner && newTopicTitle) {
    if (cleanQuery.length >= 2 && !exactMatchFound) {
      newTopicTitle.textContent = query.trim();
      aiBanner.classList.remove('hidden');
    } else {
      aiBanner.classList.add('hidden');
    }
  }

  if (allSkills.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: 16px; border: 1px dashed var(--border-subtle);">
        <div style="font-size: 32px; margin-bottom: 8px;">💡</div>
        <h3 style="color: var(--text-primary); margin: 0 0 6px 0;">No Matching Skill Found</h3>
        <p style="font-size: 13px; margin: 0 0 16px 0;">Would you like to build an 11-reel skill pack for "<strong>${query}</strong>"?</p>
        <button class="btn-primary" onclick="buildSearchedSkill()">✨ Build 11-Reel Skill Course</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = allSkills.map(qp => {
    const isCustom = qp.type === 'custom_ai' || (qp.id && qp.id.startsWith('CUSTOM-')) || qp.sector === 'Custom Micro-Learning';
    const safeTitle = (qp.title || 'Skill Course').replace(/'/g, "\\'");
    
    return `
      <div class="qp-card" onclick="openCurriculumReels('${qp.id || qp.qp_code}')" style="${isCustom ? 'border-color: rgba(168, 85, 247, 0.35);' : ''}">
        <div class="qp-card-header">
          ${isCustom 
            ? `<span class="badge-ai-custom">✨ CUSTOM AI</span>` 
            : `<span class="qp-code-badge">🇮🇳 ${qp.qp_code || 'NSQF'} ${qp.version ? '• v' + qp.version : ''}</span>`
          }
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="qp-level-tag">Level ${qp.nsqf_level || 3}</span>
            ${isCustom ? `
              <button class="btn-secondary" onclick="copyCustomSkillUrl('${qp.id}', event)" style="font-size: 11px; padding: 2px 7px; background: var(--accent-cyan-bg); border: 1px solid var(--accent-cyan-border); color: var(--accent-cyan); border-radius: 6px; font-weight: 700; cursor: pointer;">
                🔗 Link
              </button>
              <button class="btn-delete-skill" onclick="deleteCustomSkill('${qp.id}', '${safeTitle}', event)" title="Delete Skill Pack">
                🗑️
              </button>
            ` : ''}
          </div>
        </div>

        <div style="margin-top: 10px;">
          <h3 class="qp-title">${qp.title}</h3>
          <p class="qp-subtitle" style="margin-top: 6px;">${qp.subtitle || ''}</p>
          <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 11px; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px; color: var(--text-secondary);">
              🏢 ${qp.sector || 'General'}
            </span>
            ${qp.pdf_url && qp.pdf_url !== '#' ? `
              <a href="${qp.pdf_url}" target="_blank" onclick="event.stopPropagation()" style="font-size: 11px; color: var(--accent-cyan); text-decoration: none;">
                📄 Govt Syllabus ↗
              </a>
            ` : ''}
          </div>
        </div>

        <div class="qp-card-footer">
          <span class="lesson-meta" style="${isCustom ? 'color: #c084fc;' : ''}">🎬 11 Standardized Reels</span>
          <span class="btn-open-reels">Play Course ➔</span>
        </div>
      </div>
    `;
  }).join('');
}

async function openCurriculumReels(idOrCode) {
  const curriculum = await dbClient.getCurriculumById(idOrCode);
  if (curriculum) {
    const formatted = formatStandardizedCurriculum(curriculum);
    reelViewer.loadReelPackage(formatted);
  }
}

function buildSearchedSkill() {
  const input = document.getElementById('universalSearchInput');
  if (input && input.value.trim()) {
    buildReelCurriculum(input.value.trim());
  }
}

/* AI SKILL BUILD ENGINE */
async function buildReelCurriculum(topicText) {
  const input = document.getElementById('universalSearchInput');
  const aiBanner = document.getElementById('aiBuildBanner');
  const errorMsg = document.getElementById('aiErrorMsg');
  const btn = document.getElementById('btnBuildSkill');

  if (aiBanner) aiBanner.classList.add('hidden');
  if (errorMsg) errorMsg.style.display = 'none';
  if (btn) btn.disabled = true;

  try {
    const curriculum = await aiEngine.generate11ReelCurriculum(topicText, () => {});
    const formatted = formatStandardizedCurriculum(curriculum);

    await dbClient.saveCurriculum(formatted);
    renderUnifiedCatalogue();

    if (input) input.value = formatted.title;
    reelViewer.loadReelPackage(formatted);
  } catch (err) {
    if (errorMsg) {
      errorMsg.textContent = `⚠️ ${err.message}`;
      errorMsg.style.display = 'block';
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function deleteCustomSkill(id, title, event) {
  if (event) event.stopPropagation();

  if (!confirm(`Are you sure you want to delete "${title}"? This will permanently remove its 11 reels and checklist progress.`)) {
    return;
  }

  await dbClient.deleteCurriculum(id);
  renderUnifiedCatalogue();
}

function copyCustomSkillUrl(id, event) {
  if (event) event.stopPropagation();
  const url = `https://skillpedia.pages.dev/reel.html?qp=${id}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    alert(`🔗 Skill Course Link Copied!\n\n${url}`);
  } else {
    alert(`🔗 Skill Course URL:\n${url}`);
  }
}

/* URL PARAMETER DEEP-LINK PARSER */
async function handleUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  
  if (!params.has('qp') && !params.has('pack')) return;

  const modal = document.getElementById('learnerModal');
  const modalContent = document.getElementById('learnerModalContent');
  if (!modal || !modalContent) return;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

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
  }
}

function closeLearnerModal() {
  const modal = document.getElementById('learnerModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
}
