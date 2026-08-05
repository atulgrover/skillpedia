/**
 * SkillPedia Standardized 11-Reel HTML Viewer & Template Engine
 */

class SkillReelViewer {
  constructor() {
    this.currentCurriculum = null;
    this.currentLessonIndex = 0;
    this.employerInfo = null;
  }

  /**
   * Mounts the reel player into a given container or opens in modal view
   */
  loadReelPackage(curriculum, employerInfo = null) {
    this.currentCurriculum = curriculum;
    this.currentLessonIndex = 0;
    this.employerInfo = employerInfo;

    const sideInspector = document.getElementById('sideInspector');
    if (!sideInspector) return;

    this.renderViewer(sideInspector);
    sideInspector.classList.remove('hidden');

    // Scroll into view on mobile
    if (window.innerWidth <= 768) {
      sideInspector.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Mounts the reel player into a specific container element (used for fullscreen learner modal)
   */
  loadReelPackageInto(curriculum, container, employerInfo = null) {
    this.currentCurriculum = curriculum;
    this.currentLessonIndex = 0;
    this.employerInfo = employerInfo;
    this._container = container; // remember custom container for re-renders

    this.renderViewer(container);
  }

  renderViewer(container) {
    const curr = this.currentCurriculum;
    const lesson = curr.lessons[this.currentLessonIndex];
    const totalReels = curr.lessons.length;
    const savedProgress = this.getLessonProgress(curr.id, lesson.id);

    container.innerHTML = `
      <div class="reel-player-wrapper">
        
        <!-- LEARNER MODE DIRECT HEADER BAR -->
        ${document.body.classList.contains('learner-mode') ? `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 10px 14px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px;">
            <span style="font-size: 13px; font-weight: 700; color: var(--accent-cyan);">🎓 SkillPedia Learner View</span>
            <button onclick="reelViewer.exitLearnerMode()" style="background: var(--bg-card); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 11px; padding: 4px 10px; border-radius: 8px; font-weight: 700; cursor: pointer;">
              🏠 Explore All Skills
            </button>
          </div>
        ` : ''}

        <!-- EMPLOYER BRANDING HEADER (IF SHARED LINK) -->
        ${this.employerInfo ? `
          <div class="employer-banner-header">
            <div class="employer-badge">🏢 ${this.employerInfo.company_name} Training</div>
            <div class="employer-role">${this.employerInfo.target_role || 'Employee Skill Pack'}</div>
            ${this.employerInfo.instructor_note ? `<p class="employer-note">💬 Note: ${this.employerInfo.instructor_note}</p>` : ''}
          </div>
        ` : ''}

        <!-- 11-REEL PROGRESS BAR -->
        <div class="reel-step-tracker">
          <div class="reel-step-header">
            <span class="reel-count-badge">Reel ${this.currentLessonIndex + 1} of ${totalReels}</span>
            <span class="reel-nos-badge">${lesson.nos_code}</span>
          </div>
          <div class="reel-progress-pills">
            ${curr.lessons.map((_, idx) => `
              <div class="progress-pill ${idx === this.currentLessonIndex ? 'active' : ''} ${idx < this.currentLessonIndex ? 'completed' : ''}"
                   onclick="reelViewer.jumpToReel(${idx})" title="Reel ${idx + 1}"></div>
            `).join('')}
          </div>
        </div>

        <!-- VIDEO PLAYER BOX -->
        <div class="reel-video-container">
          <iframe id="reelIframe"
                  src="https://www.youtube-nocookie.com/embed/${lesson.video_id}?rel=0&modestbranding=1&enablejsapi=1"
                  title="${lesson.title}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen>
          </iframe>
        </div>

        <!-- REEL METADATA & NAV CONTROLS -->
        <div class="reel-controls-bar">
          <button class="btn-reel-nav" ${this.currentLessonIndex === 0 ? 'disabled' : ''} onclick="reelViewer.prevReel()">
            ◀ Prev Reel
          </button>
          
          <button class="btn-phone-shortcut" onclick="reelViewer.savePhoneShortcut('${curr.id}')" title="Save link shortcut on phone">
            📲 Add Shortcut
          </button>

          <button class="btn-reel-nav primary" ${this.currentLessonIndex === totalReels - 1 ? 'disabled' : ''} onclick="reelViewer.nextReel()">
            Next Reel ▶
          </button>
        </div>

        <!-- LESSON TITLE & SUBTITLE -->
        <div class="reel-info-box">
          <h2 class="reel-title">${lesson.title}</h2>
          <p class="reel-subtitle">${lesson.subtitle}</p>
        </div>

        <!-- DIRECT URL-LINK BOX -->
        <div class="url-link-box" style="margin-top: 10px; margin-bottom: 14px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 12px 16px;">
          <label style="font-size: 11px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 6px;">
            🔗 URL-LINK
          </label>
          <div style="display: flex; gap: 8px;">
            <input type="text" readonly value="https://skillpedia.pages.dev/reel.html?qp=${curr.id}" 
                   onclick="this.select()"
                   id="courseUrlInput"
                   style="flex: 1; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); color: var(--accent-cyan); font-size: 12px; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-weight: 600;">
            <button onclick="reelViewer.copyCourseLink('${curr.id}')" 
                    style="background: var(--accent-cyan-bg); border: 1px solid var(--accent-cyan-border); color: var(--accent-cyan); border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
              📋 Copy URL-Link
            </button>
          </div>
        </div>

        <!-- PERFORMANCE CRITERIA (PC) CHECKLIST -->
        <div class="pc-checklist-card">
          <div class="pc-card-header">
            <h3>📋 Performance Criteria (PC) Checklist</h3>
            <span class="pc-progress-count" id="pcCompletedCount">0 / ${lesson.pcs.length} Completed</span>
          </div>

          <div class="pc-list">
            ${lesson.pcs.map((pcText, pcIdx) => {
              const isChecked = savedProgress.includes(pcIdx);
              return `
                <label class="pc-item ${isChecked ? 'checked' : ''}">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="reelViewer.togglePCCheck('${curr.id}', '${lesson.id}', ${pcIdx}, this)">
                  <span class="pc-text">${pcText}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- FOOTER & REPORT SAFETY BUTTON -->
        <div class="reel-footer-actions">
          <button class="btn-report-safety" onclick="reelViewer.reportSafetyModal('${curr.id}')">
            🚩 Report Inappropriate Content
          </button>
        </div>

      </div>
    `;

    this.updatePCCount(savedProgress.length, lesson.pcs.length);
  }

  copyCourseLink(currId) {
    const url = `https://skillpedia.pages.dev/reel.html?qp=${currId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert(`🔗 URL-Link Copied to Clipboard!\n\n${url}`);
    } else {
      alert(`🔗 URL-Link:\n${url}`);
    }
  }

  jumpToReel(index) {
    if (index >= 0 && index < this.currentCurriculum.lessons.length) {
      this.currentLessonIndex = index;
      const container = this._container || document.getElementById('sideInspector');
      if (container) this.renderViewer(container);
    }
  }

  nextReel() {
    this.jumpToReel(this.currentLessonIndex + 1);
  }

  prevReel() {
    this.jumpToReel(this.currentLessonIndex - 1);
  }

  togglePCCheck(currId, lessonId, pcIdx, checkboxElem) {
    const key = `pc_prog_${currId}_${lessonId}`;
    let saved = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (checkboxElem.checked) {
      if (!saved.includes(pcIdx)) saved.push(pcIdx);
      checkboxElem.closest('.pc-item').classList.add('checked');
    } else {
      saved = saved.filter(i => i !== pcIdx);
      checkboxElem.closest('.pc-item').classList.remove('checked');
    }

    localStorage.setItem(key, JSON.stringify(saved));
    const totalPcs = this.currentCurriculum.lessons[this.currentLessonIndex].pcs.length;
    this.updatePCCount(saved.length, totalPcs);
  }

  getLessonProgress(currId, lessonId) {
    const key = `pc_prog_${currId}_${lessonId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  updatePCCount(completed, total) {
    const countElem = document.getElementById('pcCompletedCount');
    if (countElem) {
      countElem.textContent = `${completed} / ${total} Completed`;
    }
  }

  savePhoneShortcut(currId) {
    const url = `https://skillpedia.pages.dev/reel.html?qp=${currId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert(`📲 Shortcut Link Copied!\n\nLink: ${url}\n\nOpen this link on your phone browser and tap "Add to Home Screen" to install direct access.`);
    } else {
      alert(`📲 Save this link as a phone shortcut:\n${url}`);
    }
  }

  reportSafetyModal(currId) {
    const reason = prompt("🚩 Report Inappropriate Content:\n\nPlease specify the reason for reporting this reel (e.g. offensive video, safety violation, non-vocational content):");
    if (reason && reason.trim()) {
      dbClient.reportContent(currId, reason.trim());
      alert("Thank you. Your report has been submitted for safety review.");
    }
  }

  exitLearnerMode() {
    document.body.classList.remove('learner-mode');
    window.history.pushState({}, '', window.location.pathname);
    const sideInspector = document.getElementById('sideInspector');
    if (sideInspector) sideInspector.classList.add('hidden');
    if (typeof switchSection === 'function') {
      const tabs = document.querySelectorAll('.nav-tab-btn');
      if (tabs.length > 0) switchSection('sectionNSQF', tabs[0]);
    }
  }
}

const reelViewer = new SkillReelViewer();
