/**
 * SkillPedia Database Client (2-Table Normalized Edge DB Architecture)
 * Table 1: skills_curriculum (Immutable NOS Educational Standards & PCs)
 * Table 2: skill_reels_media (Dynamic Video Sources, Candidates & Multi-lingual Mappings)
 */

const STORAGE_KEY_PACKAGES = 'skillpedia_cached_packages';
const STORAGE_KEY_REPORTS = 'skillpedia_content_reports';

class SkillPediaDB {
  constructor() {
    this.tursoConfig = {
      url: window.TURSO_DB_URL || '',
      authToken: window.TURSO_DB_TOKEN || ''
    };
    console.log('%c[DB] SkillPediaDB initialized in 2-Table Normalized Cloud Mode', 'color: #38bdf8; font-weight: bold');
    this.initLocalStore();
  }

  initLocalStore() {
    localStorage.removeItem('skillpedia_cached_curricula');
    localStorage.removeItem('skillpedia_cache_ver');
    
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

    if (!url || !token) {
      console.warn('[DB] ❌ No Turso URL or Token — skipping remote query');
      return null;
    }

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
      console.error('[DB] ❌ Turso Edge query error:', err.message);
      return null;
    }
  }

  /**
   * Search for pre-built curricula directly from Turso Edge Database (2-Table Model)
   */
  async searchCurricula(query = '', sector = '', type = 'nsqf_official', language = 'en') {
    const cleanQuery = (query || '').toLowerCase().trim();
    const cleanSector = (sector || '').toLowerCase().trim();

    console.log(`%c[DB] 2-Table Cloud Search (query="${cleanQuery}", sector="${cleanSector}", type="${type}", lang="${language}")`, 'color: #22d3ee; font-weight: bold');

    let items = [];
    // 1. Fetch Educational Blueprints from Table 1 (skills_curriculum)
    const dbRes = await this.executeTursoPipeline([
      { sql: "SELECT skill_id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, nos_units_json, created_at FROM skills_curriculum ORDER BY created_at DESC;" },
      { sql: "SELECT skill_id, reel_index, video_platform, video_id, candidates_json FROM skill_reels_media WHERE language = ? ORDER BY reel_index ASC;", args: [{ type: 'text', value: language }] }
    ]);

    if (dbRes && dbRes.results && dbRes.results[0] && dbRes.results[0].type === 'ok') {
      const currRows = dbRes.results[0].response.result.rows || [];
      const mediaRows = (dbRes.results[1] && dbRes.results[1].type === 'ok') ? (dbRes.results[1].response.result.rows || []) : [];

      // Map media by skill_id
      const mediaMap = {};
      mediaRows.forEach(m => {
        const sId = m[0]?.value;
        const idx = Number(m[1]?.value);
        if (!mediaMap[sId]) mediaMap[sId] = {};
        let candidates = [];
        try { candidates = JSON.parse(m[4]?.value || '[]'); } catch (_) {}
        mediaMap[sId][idx] = {
          video_platform: m[2]?.value || 'youtube',
          video_id: m[3]?.value || '',
          candidates: candidates
        };
      });

      items = currRows.map(r => {
        const sId = r[0]?.value;
        let nosUnits = [];
        try { nosUnits = JSON.parse(r[9]?.value || '[]'); } catch (e) { console.error('[DB] JSON parse error:', e); }

        // Hydrate lessons with video mapping from Table 2 (skill_reels_media)
        const lessons = nosUnits.map((nos, i) => {
          const reelIdx = i + 1;
          const media = mediaMap[sId]?.[reelIdx] || { video_platform: 'youtube', video_id: '', candidates: [] };
          return {
            ...nos,
            video_platform: media.video_platform,
            video_id: media.video_id,
            candidates: media.candidates
          };
        });

        return {
          id: sId,
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
    }

    // Offline fallback to MOCK_QPS if database response is empty
    if (items.length === 0 && typeof MOCK_QPS !== 'undefined') {
      items = MOCK_QPS;
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
        (item.qp_code && item.qp_code.toLowerCase().includes(cleanQuery));

      const matchesSector = !cleanSector || cleanSector === 'all' || 
        (item.sector && item.sector.toLowerCase().includes(cleanSector));

      return matchesQuery && matchesSector;
    });
  }

  /**
   * Save a new 11-reel curriculum to Turso Edge DB using the 2-Table Normalized Schema
   * Table 1: skills_curriculum (NOS units & PCs)
   * Table 2: skill_reels_media (Reel Video IDs & Candidates)
   */
  async saveCurriculum(curriculum, language = 'en') {
    if (!curriculum || !curriculum.id) return curriculum;

    // Attach Creator Audit Trail
    const currentUser = (typeof authClient !== 'undefined' && authClient.getUser()) ? authClient.getUser() : null;
    if (currentUser) {
      curriculum.creator_email = currentUser.email;
      curriculum.creator_id = currentUser.id;
      curriculum.creator_name = currentUser.full_name;
    }

    console.log(`%c[DB] 2-Table UPSERT for: "${curriculum.title}" (${curriculum.id})`, 'color: #4ade80; font-weight: bold');

    const lessons = curriculum.lessons || [];

    // 1. Separate NOS Units (Table 1) from Video IDs
    const nosUnits = lessons.map((les, idx) => ({
      id: les.id || `les_${idx + 1}`,
      reel_index: idx + 1,
      nos_code: les.nos_code || `MODULE-${String(idx + 1).padStart(2, '0')}`,
      title: les.title || `Lesson ${idx + 1}`,
      subtitle: les.subtitle || '',
      pcs: Array.isArray(les.pcs) ? les.pcs : []
    }));

    const nosUnitsJson = JSON.stringify(nosUnits);

    // 2. Prepare Table 1 Statement (skills_curriculum)
    const pipelineStmts = [
      {
        sql: `INSERT INTO skills_curriculum (skill_id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, nos_units_json, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(skill_id) DO UPDATE SET
                title = excluded.title,
                subtitle = excluded.subtitle,
                sector = excluded.sector,
                nos_units_json = excluded.nos_units_json;`,
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
          { type: 'text', value: nosUnitsJson },
          { type: 'text', value: curriculum.created_at || new Date().toISOString() }
        ]
      }
    ];

    // 3. Prepare Table 2 Statements (skill_reels_media for 11 reels)
    lessons.forEach((les, idx) => {
      const reelIndex = idx + 1;
      const mediaId = `${curriculum.id}_les_${reelIndex}_${language}`;
      const candidatesJson = JSON.stringify(les.candidates || [{ video_id: les.video_id || '', title: les.title || '' }]);

      pipelineStmts.push({
        sql: `INSERT INTO skill_reels_media (id, skill_id, reel_index, video_platform, video_id, candidates_json, language, status, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                video_id = excluded.video_id,
                candidates_json = excluded.candidates_json,
                updated_at = excluded.updated_at;`,
        args: [
          { type: 'text', value: mediaId },
          { type: 'text', value: curriculum.id },
          { type: 'integer', value: String(reelIndex) },
          { type: 'text', value: les.video_platform || 'youtube' },
          { type: 'text', value: les.video_id || '' },
          { type: 'text', value: candidatesJson },
          { type: 'text', value: language },
          { type: 'text', value: 'verified' },
          { type: 'text', value: new Date().toISOString() }
        ]
      });
    });

    const res = await this.executeTursoPipeline(pipelineStmts);

    if (res) {
      console.log(`[DB] ✅ 2-Table Turso Edge UPSERT successful for: "${curriculum.title}"`);
    }

    return curriculum;
  }

  /**
   * Get a specific curriculum by ID or QP Code using 2-Table JOIN query
   */
  async getCurriculumById(idOrCode, language = 'en') {
    if (!idOrCode) return null;

    console.log(`%c[DB] 2-Table Lookup for id="${idOrCode}" (lang="${language}")`, 'color: #f472b6; font-weight: bold');

    const dbRes = await this.executeTursoPipeline([
      {
        sql: "SELECT skill_id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, nos_units_json, created_at FROM skills_curriculum WHERE skill_id = ? OR qp_code = ? LIMIT 1;",
        args: [{ type: 'text', value: idOrCode }, { type: 'text', value: idOrCode }]
      },
      {
        sql: "SELECT reel_index, video_platform, video_id, candidates_json FROM skill_reels_media WHERE (skill_id = ? OR skill_id = (SELECT skill_id FROM skills_curriculum WHERE qp_code = ? LIMIT 1)) AND language = ? ORDER BY reel_index ASC;",
        args: [{ type: 'text', value: idOrCode }, { type: 'text', value: idOrCode }, { type: 'text', value: language }]
      }
    ]);

    if (dbRes && dbRes.results && dbRes.results[0] && dbRes.results[0].type === 'ok') {
      const currRows = dbRes.results[0].response.result.rows || [];
      if (currRows.length > 0) {
        const r = currRows[0];
        const skillId = r[0]?.value;
        let nosUnits = [];
        try { nosUnits = JSON.parse(r[9]?.value || '[]'); } catch (e) { console.error('[DB] JSON parse error:', e); }

        const mediaRows = (dbRes.results[1] && dbRes.results[1].type === 'ok') ? (dbRes.results[1].response.result.rows || []) : [];
        const mediaMap = {};
        mediaRows.forEach(m => {
          const idx = Number(m[0]?.value);
          let candidates = [];
          try { candidates = JSON.parse(m[3]?.value || '[]'); } catch (_) {}
          mediaMap[idx] = {
            video_platform: m[1]?.value || 'youtube',
            video_id: m[2]?.value || '',
            candidates: candidates
          };
        });

        // Hydrate NOS units with video sources from Table 2
        const hydratedLessons = nosUnits.map((nos, i) => {
          const reelIdx = i + 1;
          const media = mediaMap[reelIdx] || { video_platform: 'youtube', video_id: '', candidates: [] };
          return {
            ...nos,
            video_platform: media.video_platform,
            video_id: media.video_id,
            candidates: media.candidates
          };
        });

        const fetched = {
          id: skillId,
          qp_code: r[1]?.value,
          type: r[2]?.value,
          version: r[3]?.value,
          title: r[4]?.value,
          subtitle: r[5]?.value,
          sector: r[6]?.value,
          nsqf_level: Number(r[7]?.value || 3),
          total_reels: Number(r[8]?.value || 11),
          lessons: hydratedLessons,
          created_at: r[10]?.value
        };

        console.log(`%c[DB] ✅ FOUND IN 2-TABLE DB: id="${fetched.id}" title="${fetched.title}"`, 'color: #4ade80; font-weight: bold');
        return fetched;
      }
    }

    // Offline fallback to MOCK_QPS
    if (typeof MOCK_QPS !== 'undefined') {
      const found = MOCK_QPS.find(item => item.qp_code === idOrCode || item.id === idOrCode);
      if (found) return found;
    }

    return null;
  }

  /**
   * Update video mapping for a single reel in Table 2 (skill_reels_media)
   */
  async updateReelVideo(skillId, reelIndex, newVideoId, language = 'en') {
    const mediaId = `${skillId}_les_${reelIndex}_${language}`;
    console.log(`[DB] Updating Reel Video in Table 2: skillId="${skillId}", reelIndex=${reelIndex}, newVideoId="${newVideoId}"`);

    await this.executeTursoPipeline([{
      sql: `UPDATE skill_reels_media SET video_id = ?, updated_at = ? WHERE id = ?;`,
      args: [
        { type: 'text', value: newVideoId },
        { type: 'text', value: new Date().toISOString() },
        { type: 'text', value: mediaId }
      ]
    }]);

    return true;
  }

  /**
   * Delete a curriculum from Table 1 and Table 2
   */
  async deleteCurriculum(id) {
    if (!id) return false;
    console.log(`[DB] Deleting "${id}" from 2-Table Turso DB`);

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`pc_prog_${id}_`)) {
        localStorage.removeItem(key);
      }
    });

    await this.executeTursoPipeline([
      { sql: "DELETE FROM skill_reels_media WHERE skill_id = ?;", args: [{ type: 'text', value: id }] },
      { sql: "DELETE FROM skills_curriculum WHERE skill_id = ? OR qp_code = ?;", args: [{ type: 'text', value: id }, { type: 'text', value: id }] }
    ]);

    return true;
  }

  /**
   * Save an Employer Package to Turso DB
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
   * Fetch an Employer Package
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
   * Submit a content safety report
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
