/**
 * SkillPedia Database Client (Turso Edge DB Primary Cloud Source & Local Offline Caching)
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
   * Executes HTTP pipeline queries directly against Turso Edge Database (/v2/pipeline)
   */
  async executeTursoPipeline(stmts) {
    const url = this.tursoConfig.url;
    const token = this.tursoConfig.authToken;

    if (!url || !token) return null;

    try {
      const hostname = url.replace('libsql://', '').replace(/\/$/, '');
      const requests = stmts.map(s => ({
        type: "execute",
        stmt: typeof s === 'string' ? { sql: s } : s
      }));

      const res = await fetch(`https://${hostname}/v2/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      });

      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[Turso DB] Remote edge query warning (falling back to client cache):', err.message);
      return null;
    }
  }

  /**
   * Search for pre-built curricula matching query string, sector, and type filter.
   * Primary Path: Turso Edge Database → Secondary Fallback: localStorage Cache.
   */
  async searchCurricula(query = '', sector = '', type = 'nsqf_official') {
    const cleanQuery = (query || '').toLowerCase().trim();
    const cleanSector = (sector || '').toLowerCase().trim();

    // 1. Primary: Try fetching live records from Turso Edge Database
    let items = [];
    const dbRes = await this.executeTursoPipeline([
      { sql: "SELECT id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, lessons_json, created_at FROM curricula ORDER BY rowid DESC;" }
    ]);

    if (dbRes && dbRes.results && dbRes.results[0] && dbRes.results[0].type === 'ok') {
      const rows = dbRes.results[0].response.result.rows || [];
      items = rows.map(r => {
        let lessons = [];
        try {
          lessons = JSON.parse(r[9]?.value || '[]');
        } catch (_) {}
        return {
          id: r[0]?.value,
          qp_code: r[1]?.value,
          type: r[2]?.value,
          version: r[3]?.value,
          title: r[4]?.value,
          subtitle: r[5]?.value,
          sector: r[6]?.value,
          nsqf_level: Number(r[7]?.value || 3),
          total_reels: Number(r[8]?.value || 11),
          lessons: lessons,
          created_at: r[10]?.value
        };
      });

      // Update local storage cache with latest cloud records
      if (items.length > 0) {
        localStorage.setItem(STORAGE_KEY_CURRICULA, JSON.stringify(items));
      }
    }

    // 2. Secondary Fallback: read from localStorage if offline
    if (items.length === 0) {
      items = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    }

    // Filter results
    return items.filter(item => {
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
   * Save a new 11-reel curriculum to Turso Edge DB & local storage
   */
  async saveCurriculum(curriculum) {
    if (!curriculum || !curriculum.id) return curriculum;

    // 1. Save to local storage for instant offline access
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

    // 2. Asynchronously UPSERT to Turso Edge Database cloud table
    this.executeTursoPipeline([{
      sql: `INSERT INTO curricula (id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, lessons_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title,
              subtitle = excluded.subtitle,
              sector = excluded.sector,
              lessons_json = excluded.lessons_json;`,
      args: [
        { type: 'text', value: curriculum.id },
        { type: 'text', value: curriculum.qp_code || curriculum.id },
        { type: 'text', value: curriculum.type || 'custom_ai' },
        { type: 'text', value: curriculum.version || '1.0' },
        { type: 'text', value: curriculum.title || '' },
        { type: 'text', value: curriculum.subtitle || '' },
        { type: 'text', value: curriculum.sector || 'Custom Micro-Learning' },
        { type: 'integer', value: String(curriculum.nsqf_level || 3) },
        { type: 'integer', value: String(curriculum.total_reels || 11) },
        { type: 'text', value: JSON.stringify(curriculum.lessons || []) },
        { type: 'text', value: curriculum.created_at || new Date().toISOString() }
      ]
    }]).then(res => {
      if (res) console.log('[Turso DB] Curriculum synced to Cloud Edge DB:', curriculum.title);
    }).catch(err => {
      console.warn('[Turso DB] Async cloud sync deferred:', err.message);
    });

    return curriculum;
  }

  /**
   * Get a specific curriculum by ID or QP Code.
   * Primary Path: Turso Edge Database → Secondary Path: localStorage Cache → Mock Data.
   */
  async getCurriculumById(idOrCode) {
    if (!idOrCode) return null;

    // 1. Primary: Check Turso Edge Database
    const dbRes = await this.executeTursoPipeline([{
      sql: "SELECT id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, lessons_json, created_at FROM curricula WHERE id = ? OR qp_code = ? LIMIT 1;",
      args: [
        { type: 'text', value: idOrCode },
        { type: 'text', value: idOrCode }
      ]
    }]);

    if (dbRes && dbRes.results && dbRes.results[0] && dbRes.results[0].type === 'ok') {
      const rows = dbRes.results[0].response.result.rows || [];
      if (rows.length > 0) {
        const r = rows[0];
        let lessons = [];
        try { lessons = JSON.parse(r[9]?.value || '[]'); } catch (_) {}
        const fetched = {
          id: r[0]?.value,
          qp_code: r[1]?.value,
          type: r[2]?.value,
          version: r[3]?.value,
          title: r[4]?.value,
          subtitle: r[5]?.value,
          sector: r[6]?.value,
          nsqf_level: Number(r[7]?.value || 3),
          total_reels: Number(r[8]?.value || 11),
          lessons: lessons,
          created_at: r[10]?.value
        };
        // Update local cache
        this.saveCurriculum(fetched);
        return fetched;
      }
    }

    // 2. Secondary: check localStorage
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    let found = cached.find(item =>
      (item.id && item.id === idOrCode) ||
      (item.qp_code && item.qp_code === idOrCode)
    );
    if (found) return found;

    // 3. Check official mock data
    if (typeof MOCK_QPS !== 'undefined') {
      found = MOCK_QPS.find(item => item.qp_code === idOrCode || item.id === idOrCode);
      if (found) return found;
    }

    // 4. Structural fallback for CUSTOM- shared links not found locally or in DB
    if (idOrCode.startsWith('CUSTOM-') && typeof aiEngine !== 'undefined') {
      const parts    = idOrCode.split('-');
      const rawTopic = parts.length >= 2 ? parts[1].replace(/_/g, ' ').trim() : '';

      if (rawTopic) {
        const formattedTitle = rawTopic.charAt(0).toUpperCase() + rawTopic.slice(1).toLowerCase();
        const skeleton = aiEngine.generateFallbackCurriculum(rawTopic, formattedTitle);
        skeleton.id    = idOrCode;
        await this.saveCurriculum(skeleton);

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
   * Delete a curriculum by ID from Turso DB and local storage
   */
  async deleteCurriculum(id) {
    if (!id) return false;

    // 1. Delete from local storage
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    const filtered = cached.filter(c => c.id !== id && c.qp_code !== id);
    localStorage.setItem(STORAGE_KEY_CURRICULA, JSON.stringify(filtered));

    // Clean up all Performance Criteria progress keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`pc_prog_${id}_`)) {
        localStorage.removeItem(key);
      }
    });

    // 2. Delete from Turso Edge Database
    this.executeTursoPipeline([{
      sql: "DELETE FROM curricula WHERE id = ? OR qp_code = ?;",
      args: [{ type: 'text', value: id }, { type: 'text', value: id }]
    }]);

    return true;
  }

  /**
   * Save an Employer Package & Share Code to Turso DB & local storage
   */
  async createEmployerPackage(pkg) {
    const packages = JSON.parse(localStorage.getItem(STORAGE_KEY_PACKAGES) || '[]');
    packages.unshift(pkg);
    localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(packages));

    this.executeTursoPipeline([{
      sql: `INSERT INTO employer_packages (package_id, employer_id, company_name, target_role, curriculum_id, instructor_note, share_code, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      args: [
        { type: 'text', value: pkg.package_id },
        { type: 'text', value: pkg.employer_id || '' },
        { type: 'text', value: pkg.company_name || '' },
        { type: 'text', value: pkg.target_role || '' },
        { type: 'text', value: pkg.curriculum_id || '' },
        { type: 'text', value: pkg.instructor_note || '' },
        { type: 'text', value: pkg.share_code || '' },
        { type: 'text', value: pkg.created_at || new Date().toISOString() }
      ]
    }]);

    return pkg;
  }

  /**
   * Fetch an Employer Package by Share Code or Package ID
   */
  async getEmployerPackage(codeOrId) {
    const dbRes = await this.executeTursoPipeline([{
      sql: "SELECT package_id, employer_id, company_name, target_role, curriculum_id, instructor_note, share_code, created_at FROM employer_packages WHERE share_code = ? OR package_id = ? LIMIT 1;",
      args: [{ type: 'text', value: codeOrId }, { type: 'text', value: codeOrId }]
    }]);

    if (dbRes && dbRes.results && dbRes.results[0] && dbRes.results[0].type === 'ok') {
      const rows = dbRes.results[0].response.result.rows || [];
      if (rows.length > 0) {
        const r = rows[0];
        return {
          package_id: r[0]?.value,
          employer_id: r[1]?.value,
          company_name: r[2]?.value,
          target_role: r[3]?.value,
          curriculum_id: r[4]?.value,
          instructor_note: r[5]?.value,
          share_code: r[6]?.value,
          created_at: r[7]?.value
        };
      }
    }

    const packages = JSON.parse(localStorage.getItem(STORAGE_KEY_PACKAGES) || '[]');
    return packages.find(p => p.package_id === codeOrId || p.share_code === codeOrId) || null;
  }

  /**
   * Submit a content safety report to Turso DB
   */
  async reportContent(packageId, reason) {
    const report = {
      report_id: `rep_${Date.now()}`,
      package_id: packageId,
      reason: reason,
      timestamp: new Date().toISOString()
    };

    const reports = JSON.parse(localStorage.getItem(STORAGE_KEY_REPORTS) || '[]');
    reports.push(report);
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));

    this.executeTursoPipeline([{
      sql: "INSERT INTO content_reports (report_id, package_id, reason, timestamp) VALUES (?, ?, ?, ?);",
      args: [
        { type: 'text', value: report.report_id },
        { type: 'text', value: report.package_id },
        { type: 'text', value: report.reason },
        { type: 'text', value: report.timestamp }
      ]
    }]);

    return true;
  }
}

const dbClient = new SkillPediaDB();
