/**
 * SkillPedia Database Client (Turso Edge DB Primary Cloud Source & Local Offline Caching)
 * 🔍 EXTENSIVE DEBUG LOGGING ENABLED
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
    console.log('%c[DB] SkillPediaDB constructor called', 'color: #38bdf8; font-weight: bold');
    console.log('[DB] Turso URL configured:', this.tursoConfig.url ? '✅ YES' : '❌ MISSING');
    console.log('[DB] Turso Token configured:', this.tursoConfig.authToken ? `✅ YES (${this.tursoConfig.authToken.slice(0, 20)}...)` : '❌ MISSING');
    this.initLocalStore();
  }

  initLocalStore() {
    const existing = localStorage.getItem(STORAGE_KEY_CURRICULA);
    if (!existing) {
      const mockCount = (typeof MOCK_QPS !== 'undefined' && Array.isArray(MOCK_QPS)) ? MOCK_QPS.length : 0;
      console.log(`[DB] initLocalStore: No cached curricula found. Seeding from MOCK_QPS (${mockCount} items)`);
      localStorage.setItem(STORAGE_KEY_CURRICULA, JSON.stringify(MOCK_QPS || []));
    } else {
      const parsed = JSON.parse(existing);
      console.log(`[DB] initLocalStore: Found ${parsed.length} cached curricula in localStorage`);
      parsed.forEach((c, i) => {
        const firstVid = (c.lessons && c.lessons[0]) ? c.lessons[0].video_id : 'NO_LESSONS';
        console.log(`  [DB] cached[${i}]: id="${c.id}" title="${c.title}" type="${c.type}" firstVideoId="${firstVid}"`);
      });
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

    if (!url || !token) {
      console.warn('[DB] executeTursoPipeline: ❌ No Turso URL or Token — skipping remote query');
      return null;
    }

    try {
      const hostname = url.replace('libsql://', '').replace(/\/$/, '');
      const requests = stmts.map(s => ({
        type: "execute",
        stmt: typeof s === 'string' ? { sql: s } : s
      }));

      console.log(`%c[DB] executeTursoPipeline: Sending ${requests.length} statement(s) to https://${hostname}/v2/pipeline`, 'color: #a78bfa');
      requests.forEach((r, i) => {
        console.log(`  [DB] stmt[${i}]: ${r.stmt.sql.substring(0, 120)}...`);
        if (r.stmt.args) {
          console.log(`  [DB] args[${i}]:`, r.stmt.args.map(a => `${a.type}:${String(a.value).substring(0, 50)}`).join(', '));
        }
      });

      const res = await fetch(`https://${hostname}/v2/pipeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      });

      console.log(`[DB] executeTursoPipeline: HTTP status = ${res.status} ${res.statusText}`);

      if (!res.ok) {
        console.error(`[DB] executeTursoPipeline: ❌ HTTP error ${res.status}`);
        return null;
      }

      const json = await res.json();
      console.log('[DB] executeTursoPipeline: Raw response:', JSON.stringify(json).substring(0, 500));

      if (json.results) {
        json.results.forEach((r, i) => {
          if (r.type === 'ok') {
            const rowCount = r.response?.result?.rows?.length || 0;
            console.log(`  [DB] result[${i}]: ✅ OK — ${rowCount} row(s) returned`);
          } else if (r.type === 'error') {
            console.error(`  [DB] result[${i}]: ❌ ERROR — ${r.error?.message}`);
          }
        });
      }

      return json;
    } catch (err) {
      console.error('[DB] executeTursoPipeline: ❌ Network/fetch error:', err.message, err);
      return null;
    }
  }

  /**
   * Search for pre-built curricula matching query string, sector, and type filter.
   */
  async searchCurricula(query = '', sector = '', type = 'nsqf_official') {
    console.log(`%c[DB] searchCurricula(query="${query}", sector="${sector}", type="${type}")`, 'color: #22d3ee; font-weight: bold');
    const cleanQuery = (query || '').toLowerCase().trim();
    const cleanSector = (sector || '').toLowerCase().trim();

    // 1. Primary: Try fetching live records from Turso Edge Database
    let items = [];
    const dbRes = await this.executeTursoPipeline([
      { sql: "SELECT id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, lessons_json, created_at FROM curricula ORDER BY rowid DESC;" }
    ]);

    if (dbRes && dbRes.results && dbRes.results[0] && dbRes.results[0].type === 'ok') {
      const rows = dbRes.results[0].response.result.rows || [];
      console.log(`[DB] searchCurricula: Turso returned ${rows.length} total rows`);
      items = rows.map(r => {
        let lessons = [];
        try {
          lessons = JSON.parse(r[9]?.value || '[]');
        } catch (e) {
          console.error(`[DB] searchCurricula: JSON parse error for lessons_json of id="${r[0]?.value}":`, e);
        }
        const item = {
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
        const firstVid = lessons[0]?.video_id || 'NONE';
        console.log(`  [DB] Turso row: id="${item.id}" title="${item.title}" type="${item.type}" lessons=${lessons.length} firstVid="${firstVid}"`);
        return item;
      });

      // Update local storage cache with latest cloud records
      if (items.length > 0) {
        console.log(`[DB] searchCurricula: Updating localStorage cache with ${items.length} Turso items`);
        localStorage.setItem(STORAGE_KEY_CURRICULA, JSON.stringify(items));
      }
    } else {
      console.warn('[DB] searchCurricula: Turso query failed or returned no results, falling back to localStorage');
    }

    // 2. Secondary Fallback: read from localStorage if offline
    if (items.length === 0) {
      items = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
      console.log(`[DB] searchCurricula: localStorage fallback loaded ${items.length} items`);
    }

    // Filter results
    const filtered = items.filter(item => {
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

    console.log(`[DB] searchCurricula: Returning ${filtered.length} filtered results (from ${items.length} total)`);
    return filtered;
  }

  /**
   * Save a new 11-reel curriculum to Turso Edge DB & local storage
   */
  async saveCurriculum(curriculum) {
    if (!curriculum || !curriculum.id) {
      console.warn('[DB] saveCurriculum: ❌ Called with null/no-id curriculum');
      return curriculum;
    }

    console.log(`%c[DB] saveCurriculum: id="${curriculum.id}" title="${curriculum.title}"`, 'color: #4ade80; font-weight: bold');
    if (curriculum.lessons) {
      curriculum.lessons.forEach((l, i) => {
        console.log(`  [DB] save lesson[${i}]: video_id="${l.video_id}" title="${l.title?.substring(0, 40)}"`);
      });
    }

    // 1. Save to local storage for instant offline access
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    const existingIndex = cached.findIndex(c => 
      (curriculum.id && c.id === curriculum.id) || 
      (curriculum.qp_code && c.qp_code && c.qp_code === curriculum.qp_code)
    );
    
    if (existingIndex >= 0) {
      console.log(`[DB] saveCurriculum: Updating existing entry at index ${existingIndex}`);
      cached[existingIndex] = curriculum;
    } else {
      console.log(`[DB] saveCurriculum: Adding new entry to localStorage cache`);
      cached.unshift(curriculum);
    }
    localStorage.setItem(STORAGE_KEY_CURRICULA, JSON.stringify(cached));

    // 2. Asynchronously UPSERT to Turso Edge Database cloud table
    const lessonsJson = JSON.stringify(curriculum.lessons || []);
    console.log(`[DB] saveCurriculum: Sending UPSERT to Turso Cloud (lessons_json length: ${lessonsJson.length} chars)`);

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
        { type: 'text', value: lessonsJson },
        { type: 'text', value: curriculum.created_at || new Date().toISOString() }
      ]
    }]).then(res => {
      if (res) console.log('%c[DB] saveCurriculum: ✅ Turso Cloud UPSERT success for: ' + curriculum.title, 'color: #4ade80');
      else console.warn('[DB] saveCurriculum: ⚠️ Turso Cloud UPSERT returned null');
    }).catch(err => {
      console.error('[DB] saveCurriculum: ❌ Turso Cloud UPSERT failed:', err.message);
    });

    return curriculum;
  }

  /**
   * Get a specific curriculum by ID or QP Code.
   * Primary: Turso Edge DB → Secondary: localStorage → Mock Data → Fallback Skeleton
   */
  async getCurriculumById(idOrCode) {
    if (!idOrCode) {
      console.warn('[DB] getCurriculumById: ❌ Called with null/empty id');
      return null;
    }

    console.log(`%c[DB] getCurriculumById("${idOrCode}") — START`, 'color: #f472b6; font-weight: bold; font-size: 13px');

    // 1. Primary: Check Turso Edge Database
    console.log('[DB] getCurriculumById: Step 1 — Querying Turso Edge Database...');
    const dbRes = await this.executeTursoPipeline([{
      sql: "SELECT id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, lessons_json, created_at FROM curricula WHERE id = ? OR qp_code = ? LIMIT 1;",
      args: [
        { type: 'text', value: idOrCode },
        { type: 'text', value: idOrCode }
      ]
    }]);

    if (dbRes && dbRes.results && dbRes.results[0] && dbRes.results[0].type === 'ok') {
      const rows = dbRes.results[0].response.result.rows || [];
      console.log(`[DB] getCurriculumById: Turso returned ${rows.length} row(s)`);
      if (rows.length > 0) {
        const r = rows[0];
        let lessons = [];
        try { 
          lessons = JSON.parse(r[9]?.value || '[]'); 
          console.log(`[DB] getCurriculumById: Parsed ${lessons.length} lessons from Turso DB`);
          lessons.forEach((l, i) => {
            console.log(`  [DB] Turso lesson[${i}]: video_id="${l.video_id}" title="${l.title?.substring(0, 50)}"`);
          });
        } catch (e) {
          console.error('[DB] getCurriculumById: ❌ JSON parse error on lessons_json:', e);
        }
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
        console.log(`%c[DB] getCurriculumById: ✅ FOUND IN TURSO DB — id="${fetched.id}" title="${fetched.title}" lessons=${lessons.length}`, 'color: #4ade80; font-weight: bold');
        // Update local cache
        this.saveCurriculum(fetched);
        return fetched;
      } else {
        console.warn(`[DB] getCurriculumById: ⚠️ Turso DB returned 0 rows for "${idOrCode}"`);
      }
    } else {
      console.warn('[DB] getCurriculumById: ⚠️ Turso query failed or returned error');
      if (dbRes?.results?.[0]?.type === 'error') {
        console.error('[DB] Turso error detail:', dbRes.results[0].error);
      }
    }

    // 2. Secondary: check localStorage
    console.log('[DB] getCurriculumById: Step 2 — Checking localStorage cache...');
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    console.log(`[DB] getCurriculumById: localStorage has ${cached.length} total cached items`);
    let found = cached.find(item =>
      (item.id && item.id === idOrCode) ||
      (item.qp_code && item.qp_code === idOrCode)
    );
    if (found) {
      console.log(`%c[DB] getCurriculumById: ✅ FOUND IN LOCALSTORAGE — id="${found.id}" title="${found.title}"`, 'color: #facc15; font-weight: bold');
      if (found.lessons) {
        found.lessons.forEach((l, i) => {
          console.log(`  [DB] localStorage lesson[${i}]: video_id="${l.video_id}" title="${l.title?.substring(0, 50)}"`);
        });
      }
      return found;
    } else {
      console.warn(`[DB] getCurriculumById: ⚠️ Not found in localStorage`);
    }

    // 3. Check official mock data
    console.log('[DB] getCurriculumById: Step 3 — Checking MOCK_QPS...');
    if (typeof MOCK_QPS !== 'undefined') {
      found = MOCK_QPS.find(item => item.qp_code === idOrCode || item.id === idOrCode);
      if (found) {
        console.log(`%c[DB] getCurriculumById: ✅ FOUND IN MOCK_QPS — qp_code="${found.qp_code}" title="${found.title}"`, 'color: #fb923c; font-weight: bold');
        return found;
      }
    }

    // 4. Structural fallback for CUSTOM- shared links not found locally or in DB
    console.log('[DB] getCurriculumById: Step 4 — Attempting structural fallback for CUSTOM- prefix...');
    if (idOrCode.startsWith('CUSTOM-') && typeof aiEngine !== 'undefined') {
      const parts    = idOrCode.split('-');
      const rawTopic = parts.length >= 2 ? parts[1].replace(/_/g, ' ').trim() : '';
      console.log(`[DB] getCurriculumById: Extracted rawTopic from ID: "${rawTopic}"`);

      if (rawTopic) {
        const formattedTitle = rawTopic.charAt(0).toUpperCase() + rawTopic.slice(1).toLowerCase();
        console.log(`%c[DB] getCurriculumById: ⚠️ GENERATING FALLBACK SKELETON for "${formattedTitle}" — THIS IS THE PROBLEM PATH IF WRONG VIDEOS APPEAR`, 'color: #ef4444; font-weight: bold; font-size: 13px');
        const skeleton = aiEngine.generateFallbackCurriculum(rawTopic, formattedTitle);
        skeleton.id    = idOrCode;
        console.log(`[DB] getCurriculumById: Fallback skeleton generated with ${skeleton.lessons?.length} lessons`);
        skeleton.lessons?.forEach((l, i) => {
          console.log(`  [DB] fallback lesson[${i}]: video_id="${l.video_id}" title="${l.title?.substring(0, 50)}"`);
        });
        await this.saveCurriculum(skeleton);

        console.log('[DB] getCurriculumById: Starting _backgroundUpgrade to replace skeleton...');
        this._backgroundUpgrade(idOrCode, rawTopic);

        return skeleton;
      }
    }

    console.error(`%c[DB] getCurriculumById: ❌ COMPLETE FAILURE — Could not find "${idOrCode}" anywhere`, 'color: #ef4444; font-weight: bold');
    return null;
  }

  async _backgroundUpgrade(idOrCode, rawTopic) {
    console.log(`[DB] _backgroundUpgrade: Starting upgrade for "${rawTopic}" (${idOrCode})`);
    try {
      const upgraded = await aiEngine.generate11ReelCurriculum(rawTopic, () => {}, true);
      if (upgraded) {
        upgraded.id = idOrCode;
        delete upgraded.is_fallback;
        await this.saveCurriculum(upgraded);
        console.log(`%c[DB] _backgroundUpgrade: ✅ Upgrade complete for "${rawTopic}"`, 'color: #4ade80; font-weight: bold');
        upgraded.lessons?.forEach((l, i) => {
          console.log(`  [DB] upgraded lesson[${i}]: video_id="${l.video_id}"`);
        });
      }
    } catch (err) {
      console.warn('[DB] _backgroundUpgrade: ⚠️ Failed (non-critical):', err.message);
    }
  }

  /**
   * Delete a curriculum by ID from Turso DB and local storage
   */
  async deleteCurriculum(id) {
    if (!id) return false;
    console.log(`[DB] deleteCurriculum: Deleting "${id}"`);

    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY_CURRICULA) || '[]');
    const filtered = cached.filter(c => c.id !== id && c.qp_code !== id);
    localStorage.setItem(STORAGE_KEY_CURRICULA, JSON.stringify(filtered));
    console.log(`[DB] deleteCurriculum: localStorage ${cached.length} → ${filtered.length} items`);

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`pc_prog_${id}_`)) {
        localStorage.removeItem(key);
      }
    });

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
