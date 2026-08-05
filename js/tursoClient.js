/**
 * SkillPedia Database Client (Turso Edge DB & Local IndexedDB Caching)
 */

const STORAGE_KEY_CURRICULA = 'skillpedia_cached_curricula';
const STORAGE_KEY_PACKAGES = 'skillpedia_cached_packages';
const STORAGE_KEY_REPORTS = 'skillpedia_content_reports';

class SkillPediaDB {
  constructor() {
    this.tursoConfig = {
      url: window.TURSO_DB_URL || '',
      authToken: window.TURSO_DB_TOKEN || ''
    };
    this.initLocalStore();
  }

  initLocalStore() {
    if (!localStorage.getItem(STORAGE_KEY_CURRICULA)) {
      localStorage.setItem(STORAGE_KEY_CURRICULA, JSON.stringify(MOCK_QPS || []));
    }
    if (!localStorage.getItem(STORAGE_KEY_PACKAGES)) {
      localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify([]));
    }
  }

  /**
   * Search for pre-built curricula matching a query string, sector, and type filter
   */
  async searchCurricula(query = '', sector = '', type = 'nsqf_official') {
    const cleanQuery = (query || '').toLowerCase().trim();
    const cleanSector = (sector || '').toLowerCase().trim();
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    
    return cached.filter(item => {
      const isCustom = item.type === 'custom_ai' || (item.id && item.id.startsWith('CUSTOM-')) || item.sector === 'Custom Micro-Learning';
      
      if (type === 'nsqf_official' && isCustom) return false;
      if (type === 'custom_ai' && !isCustom) return false;

      const matchesQuery = !cleanQuery || 
        (item.title && item.title.toLowerCase().includes(cleanQuery)) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(cleanQuery)) ||
        (item.sector && item.sector.toLowerCase().includes(cleanQuery)) ||
        (item.sub_sector && item.sub_sector.toLowerCase().includes(cleanQuery)) ||
        (item.qp_code && item.qp_code.toLowerCase().includes(cleanQuery));

      const matchesSector = !cleanSector || cleanSector === 'all' || 
        (item.sector && item.sector.toLowerCase().includes(cleanSector));

      return matchesQuery && matchesSector;
    });
  }

  /**
   * Save a new 11-reel curriculum to storage
   */
  async saveCurriculum(curriculum) {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    const existingIndex = cached.findIndex(c => 
      (curriculum.id && c.id === curriculum.id) || 
      (curriculum.qp_code && c.qp_code && c.qp_code === curriculum.qp_code)
    );
    
    if (existingIndex >= 0) {
      cached[existingIndex] = curriculum;
    } else {
      cached.unshift(curriculum);
    }
    
    localStorage.setItem(STORAGE_KEY_CURRICULA, JSON.stringify(cached));
    return curriculum;
  }

  /**
   * Get a specific curriculum by ID or QP Code.
   * Fast path: localStorage → MOCK_QPS.
   * For shared CUSTOM- links not found locally: return instant structural
   * fallback immediately (so the reel player shows now), then regenerate
   * with LLM in the background and save to localStorage for next visit.
   */
  async getCurriculumById(idOrCode) {
    if (!idOrCode) return null;

    // 1. Fast: check localStorage
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    let found = cached.find(item =>
      (item.id && item.id === idOrCode) ||
      (item.qp_code && item.qp_code === idOrCode)
    );
    if (found) return found;

    // 2. Fast: check official mock data
    if (typeof MOCK_QPS !== 'undefined') {
      found = MOCK_QPS.find(item => item.qp_code === idOrCode || item.id === idOrCode);
      if (found) return found;
    }

    // 3. For CUSTOM- shared links: return a fast structural skeleton IMMEDIATELY
    //    so the page loads instantly. Then kick off LLM regeneration in the
    //    background \u2014 it will save to localStorage so the next open is instant.
    if (idOrCode.startsWith('CUSTOM-') && typeof aiEngine !== 'undefined') {
      const parts    = idOrCode.split('-');
      const rawTopic = parts.length >= 2 ? parts[1].replace(/_/g, ' ').trim() : '';

      if (rawTopic) {
        // Return fast structural fallback immediately \u2014 no network calls
        const formattedTitle = rawTopic.charAt(0).toUpperCase() + rawTopic.slice(1).toLowerCase();
        const skeleton = aiEngine.generateFallbackCurriculum(rawTopic, formattedTitle);
        skeleton.id    = idOrCode; // preserve the original shared ID
        await this.saveCurriculum(skeleton);

        // Kick off background LLM upgrade (don't await)
        this._backgroundUpgrade(idOrCode, rawTopic);

        return skeleton;
      }
    }

    return null;
  }

  async _backgroundUpgrade(idOrCode, rawTopic) {
    try {
      const upgraded = await aiEngine.generate11ReelCurriculum(rawTopic, () => {}, true);
      if (upgraded) {
        upgraded.id = idOrCode;
        delete upgraded.is_fallback;
        await this.saveCurriculum(upgraded);
        console.log('[SkillPedia] Background curriculum upgrade complete for', rawTopic);
      }
    } catch (err) {
      console.warn('[SkillPedia] Background upgrade failed (non-critical):', err.message);
    }
  }


  /**
   * Delete a curriculum by ID from storage and clean up progress memory
   */
  async deleteCurriculum(id) {
    if (!id) return false;
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    const filtered = cached.filter(c => c.id !== id && c.qp_code !== id);
    localStorage.setItem(STORAGE_KEY_CURRICULA, JSON.stringify(filtered));

    // Clean up all Performance Criteria progress keys for this curriculum
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`pc_prog_${id}_`)) {
        localStorage.removeItem(key);
      }
    });

    return true;
  }

  /**
   * Save an Employer Package & Share Code
   */
  async createEmployerPackage(pkg) {
    const packages = JSON.parse(localStorage.getItem(STORAGE_KEY_PACKAGES) || '[]');
    packages.unshift(pkg);
    localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(packages));
    return pkg;
  }

  /**
   * Fetch an Employer Package by Share Code or Package ID
   */
  async getEmployerPackage(codeOrId) {
    const packages = JSON.parse(localStorage.getItem(STORAGE_KEY_PACKAGES) || '[]');
    return packages.find(p => p.package_id === codeOrId || p.share_code === codeOrId) || null;
  }

  /**
   * Submit a content safety report
   */
  async reportContent(packageId, reason) {
    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || '[]');
    reports.push({
      report_id: `rep_${Date.now()}`,
      package_id: packageId,
      reason: reason,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    return true;
  }
}

const dbClient = new SkillPediaDB();
