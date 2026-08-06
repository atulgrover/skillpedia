/**
 * SkillPedia Standardized 11-Reel HTML Viewer & Interactive Creator Confirmation Studio
 */

class SkillReelViewer {
  constructor() {
    this.currentCurriculum = null;
    this.currentLessonIndex = 0;
    this.employerInfo = null;
    this.studioDraft = null;
    this.confirmedReels = new Set();
  }

  /**
   * Opens the Interactive Creator 11-Reel Confirmation & Preview Studio
   */
  openCreatorConfirmationStudio(llmResult) {
    this.studioDraft = JSON.parse(JSON.stringify(llmResult)); // deep copy draft
    this.confirmedReels = new Set();

    let modal = document.getElementById('creatorStudioModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'creatorStudioModal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    this.renderStudioModal(modal);
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  renderStudioModal(modal) {
    const draft = this.studioDraft;
    const total = draft.lessons.length;
    const confirmedCount = this.confirmedReels.size;

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 780px; width: 95%; max-height: 90vh; overflow-y: auto; padding: 24px; background: var(--bg-drawer); border: 1px solid var(--accent-cyan-border); border-radius: 20px; box-shadow: var(--shadow-card);">
        
        <!-- STUDIO HEADER -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 24px;">🎨</span>
              <h2 style="font-size: 20px; font-weight: 800; color: var(--text-primary); margin: 0;">Creator 11-Reel Confirmation Studio</h2>
            </div>
            <p style="font-size: 13px; color: var(--text-secondary); margin: 4px 0 0 0;">Inspect, preview & confirm all 11 reels step-by-step for "<strong>${draft.title}</strong>".</p>
          </div>
          <button onclick="reelViewer.closeStudioModal()" style="background: transparent; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer;">✕</button>
        </div>

        <!-- PROGRESS BAR -->
        <div style="margin-bottom: 20px; background: var(--bg-card); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">Reels Confirmed: ${confirmedCount} / ${total}</span>
          <div style="width: 200px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
            <div style="width: ${(confirmedCount / total) * 100}%; height: 100%; background: var(--accent-cyan); transition: width 0.3s ease;"></div>
          </div>
        </div>

        <!-- 11 REEL CONFIRMATION CARDS -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${draft.lessons.map((les, idx) => {
            const isConfirmed = this.confirmedReels.has(idx);
            const candidates = les.candidates || [{ video_id: les.video_id, title: les.title }];

            return `
              <div id="studioCard_${idx}" style="background: var(--bg-card); border: 1px solid ${isConfirmed ? '#4ade80' : 'var(--border-subtle)'}; border-radius: 16px; padding: 16px; transition: border-color 0.3s ease;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--accent-cyan-bg); color: var(--accent-cyan); font-weight: 800; font-size: 12px; padding: 2px 8px; border-radius: 6px;">Reel ${idx + 1} of ${total}</span>
                    <strong style="font-size: 15px; color: var(--text-primary);">${les.title}</strong>
                  </div>
                  <button onclick="reelViewer.toggleReelConfirmation(${idx})" style="background: ${isConfirmed ? '#4ade80' : 'var(--bg-primary)'}; color: ${isConfirmed ? '#000' : 'var(--text-primary)'}; border: 1px solid ${isConfirmed ? '#4ade80' : 'var(--border-subtle)'}; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer;">
                    ${isConfirmed ? '✅ Confirmed' : '⭕ Click to Confirm Reel'}
                  </button>
                </div>

                <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 12px 0;">${les.subtitle}</p>

                <!-- VIDEO PLAYER PREVIEW -->
                <div style="margin-bottom: 12px; border-radius: 12px; overflow: hidden; background: #000; position: relative; padding-top: 56.25%;">
                  <iframe id="studioIframe_${idx}" src="https://www.youtube.com/embed/${les.video_id}?enablejsapi=1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>

                <!-- VIDEO ALTERNATIVE CANDIDATES -->
                <div style="margin-bottom: 12px;">
                  <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">🔄 AI-Suggested Video Alternatives:</label>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${candidates.map((cand, cIdx) => `
                      <button onclick="reelViewer.swapStudioVideo(${idx}, '${cand.video_id}')" style="text-align: left; background: ${les.video_id === cand.video_id ? 'var(--accent-cyan-bg)' : 'var(--bg-primary)'}; border: 1px solid ${les.video_id === cand.video_id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}; color: var(--text-primary); padding: 8px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                        <span>${cIdx === 0 ? '⭐ Top Match:' : `Option ${cIdx + 1}:`} ${cand.title.substring(0, 50)}...</span>
                        <span style="font-family: monospace; font-size: 11px; opacity: 0.7;">ID: ${cand.video_id}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- PASTE CUSTOM YOUTUBE LINK -->
                <div>
                  <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">🔗 Paste Custom YouTube URL (Optional):</label>
                  <div style="display: flex; gap: 8px;">
                    <input type="text" id="customUrlInput_${idx}" placeholder="https://www.youtube.com/watch?v=..." style="flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); font-size: 12px;">
                    <button onclick="reelViewer.applyCustomUrl(${idx})" class="btn-primary" style="padding: 8px 14px; font-size: 12px; font-weight: 700; border-radius: 8px;">Apply URL</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- FOOTER ACTIONS -->
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <button onclick="reelViewer.closeStudioModal()" style="background: transparent; border: 1px solid var(--border-subtle); color: var(--text-secondary); padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">
            Cancel
          </button>
          <button onclick="reelViewer.publishVerifiedCourse()" class="btn-primary" style="padding: 12px 24px; font-size: 15px; font-weight: 800; border-radius: 12px; box-shadow: var(--shadow-glow);">
            🚀 Publish 11-Reel Skill Course to Turso Edge DB
          </button>
        </div>

      </div>
    `;
  }

  toggleReelConfirmation(idx) {
    if (this.confirmedReels.has(idx)) {
      this.confirmedReels.delete(idx);
    } else {
      this.confirmedReels.add(idx);
    }
    const modal = document.getElementById('creatorStudioModal');
    if (modal) this.renderStudioModal(modal);
  }

  swapStudioVideo(idx, videoId) {
    if (this.studioDraft && this.studioDraft.lessons[idx]) {
      this.studioDraft.lessons[idx].video_id = videoId;
      const iframe = document.getElementById(`studioIframe_${idx}`);
      if (iframe) iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
      const modal = document.getElementById('creatorStudioModal');
      if (modal) this.renderStudioModal(modal);
    }
  }

  async applyCustomUrl(idx) {
    const input = document.getElementById(`customUrlInput_${idx}`);
    if (!input || !input.value.trim()) return;

    const rawUrl = input.value.trim();
    if (typeof validateYouTubeUrlSafety === 'function') {
      const audit = await validateYouTubeUrlSafety(rawUrl);
      if (!audit.safe) {
        alert(audit.reason);
        return;
      }
      this.swapStudioVideo(idx, audit.videoId);
    } else {
      const match = rawUrl.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
      if (match) {
        this.swapStudioVideo(idx, match[1]);
      } else {
        alert('Invalid YouTube URL format.');
      }
    }
  }

  async publishVerifiedCourse() {
    if (!this.studioDraft) return;

    const formatted = formatStandardizedCurriculum({
      id: `CUSTOM-${this.studioDraft.title.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 15)}-${Date.now().toString().slice(-4)}`,
      type: CURRICULUM_TYPES.CUSTOM_AI,
      title: this.studioDraft.title,
      subtitle: this.studioDraft.subtitle || `AI-Curated 11-Reel Skill Module`,
      sector: this.studioDraft.sector || 'Custom Micro-Learning',
      nsqf_level: 3,
      total_reels: 11,
      lessons: this.studioDraft.lessons
    });

    await dbClient.saveCurriculum(formatted);
    this.closeStudioModal();

    if (typeof renderUnifiedCatalogue === 'function') renderUnifiedCatalogue();
    this.loadReelPackage(formatted);
  }

  closeStudioModal() {
    const modal = document.getElementById('creatorStudioModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  loadReelPackage(curriculum, employerInfo = null) {
    this.currentCurriculum = curriculum;
    this.currentLessonIndex = 0;
    this.employerInfo = employerInfo;

    const sideInspector = document.getElementById('sideInspector');
    if (!sideInspector) return;

    this.renderViewer(sideInspector);
    sideInspector.classList.remove('hidden');

    if (window.innerWidth <= 768) {
      sideInspector.scrollIntoView({ behavior: 'smooth' });
    }
  }

  renderViewer(container) {
    const curr = this.currentCurriculum;
    const lesson = curr.lessons[this.currentLessonIndex];
    const totalReels = curr.lessons.length;

    container.innerHTML = `
      <div class="reel-player-wrapper">
        <div class="reel-step-tracker">
          <div class="reel-step-header">
            <span class="reel-count-badge">Reel ${this.currentLessonIndex + 1} of ${totalReels}</span>
            <span class="reel-nos-badge">${lesson.nos_code}</span>
          </div>
          <div class="reel-progress-pills">
            ${curr.lessons.map((_, idx) => `
              <div class="progress-pill ${idx === this.currentLessonIndex ? 'active' : ''}"></div>
            `).join('')}
          </div>
        </div>

        <div class="reel-video-container">
          <iframe id="activeReelFrame" src="https://www.youtube.com/embed/${lesson.video_id}?autoplay=1&enablejsapi=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>

        <div class="reel-content-details">
          <h3 class="reel-title">${lesson.title}</h3>
          <p class="reel-subtitle">${lesson.subtitle}</p>

          <div class="pc-checklist">
            <h4>Performance Criteria (PCs)</h4>
            ${lesson.pcs.map(pc => `
              <div class="pc-item">
                <span>${pc}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="reel-nav-buttons" style="display: flex; gap: 10px; margin-top: 16px;">
          <button class="btn-secondary" onclick="reelViewer.prevLesson()" ${this.currentLessonIndex === 0 ? 'disabled' : ''}>← Previous Reel</button>
          <button class="btn-primary" onclick="reelViewer.nextLesson()" ${this.currentLessonIndex === totalReels - 1 ? 'disabled' : ''}>Next Reel →</button>
        </div>
      </div>
    `;
  }

  nextLesson() {
    if (this.currentCurriculum && this.currentLessonIndex < this.currentCurriculum.lessons.length - 1) {
      this.currentLessonIndex++;
      this.renderViewer(document.getElementById('sideInspector'));
    }
  }

  prevLesson() {
    if (this.currentCurriculum && this.currentLessonIndex > 0) {
      this.currentLessonIndex--;
      this.renderViewer(document.getElementById('sideInspector'));
    }
  }
}

const reelViewer = new SkillReelViewer();
