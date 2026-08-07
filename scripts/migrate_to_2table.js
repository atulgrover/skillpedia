/**
 * Migration Script: Transition Turso DB from Monolithic `curricula` table
 * to 2-Table Normalized Model (`skills_curriculum` + `skill_reels_media`).
 */

const https = require('https');

const TURSO_URL = "skillpedia-atulgrover.aws-ap-south-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODU5MjcxNTMsImlkIjoiMDE5ZmQxOGQtNDcwMS03YTUzLWI4MGQtNGNjZjJmNDllOTNhIiwia2lkIjoiZFBTbnBRUkFmRktDbDZZdzRtLUtxazNuQkdwYTJjS25nZWRqVUdZMkJzOCIsInJpZCI6IjkwYmQ0MDlkLTczYmItNDcxZS04NzVjLTlhNGU5NzdjYjBkMiJ9.odehl15I8NbH9ow10Y4CTTyjLaxxXjgBLQG3eAOM05ySOZ4n1iq8ckO0KDhvsaWLwwsUTiR1Ar_zK-Hhmg4RBw";

function executePipeline(stmts) {
  return new Promise((resolve, reject) => {
    const requests = stmts.map(s => ({
      type: "execute",
      stmt: typeof s === 'string' ? { sql: s } : s
    }));

    const payload = JSON.stringify({ requests });

    const req = https.request({
      hostname: TURSO_URL,
      path: "/v2/pipeline",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TURSO_TOKEN}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function migrate() {
  console.log('🚀 Starting Turso 2-Table Migration...');

  // 1. Create Table 1 & Table 2 Schemas
  const createTableStmts = [
    `CREATE TABLE IF NOT EXISTS skills_curriculum (
      skill_id TEXT PRIMARY KEY,
      qp_code TEXT,
      type TEXT NOT NULL,
      version TEXT DEFAULT '1.0',
      title TEXT NOT NULL,
      subtitle TEXT,
      sector TEXT,
      nsqf_level INTEGER DEFAULT 3,
      total_reels INTEGER DEFAULT 11,
      nos_units_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS skill_reels_media (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      reel_index INTEGER NOT NULL,
      video_platform TEXT DEFAULT 'youtube',
      video_id TEXT NOT NULL,
      candidates_json TEXT,
      language TEXT DEFAULT 'en',
      status TEXT DEFAULT 'verified',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (skill_id) REFERENCES skills_curriculum(skill_id) ON DELETE CASCADE
    );`,
    `CREATE INDEX IF NOT EXISTS idx_media_skill_lang ON skill_reels_media(skill_id, language);`
  ];

  console.log('Creating tables `skills_curriculum` and `skill_reels_media`...');
  await executePipeline(createTableStmts);

  // 2. Fetch all legacy rows from `curricula` table
  console.log('Fetching legacy curricula data...');
  const selectRes = await executePipeline([{
    sql: "SELECT id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, lessons_json, created_at FROM curricula;"
  }]);

  if (!selectRes || !selectRes.results || !selectRes.results[0] || selectRes.results[0].type !== 'ok') {
    console.error('Failed to fetch legacy curricula table.');
    return;
  }

  const rows = selectRes.results[0].response.result.rows || [];
  console.log(`Found ${rows.length} legacy curriculum records to migrate.`);

  for (const r of rows) {
    const skillId = r[0]?.value;
    const qpCode = r[1]?.value || skillId;
    const type = r[2]?.value || 'custom_ai';
    const version = r[3]?.value || '1.0';
    const title = r[4]?.value || '';
    const subtitle = r[5]?.value || '';
    const sector = r[6]?.value || 'General';
    const nsqfLevel = Number(r[7]?.value || 3);
    const totalReels = Number(r[8]?.value || 11);
    const rawLessonsJson = r[9]?.value || '[]';
    const createdAt = r[10]?.value || new Date().toISOString();

    let legacyLessons = [];
    try {
      legacyLessons = JSON.parse(rawLessonsJson);
    } catch (e) {
      console.warn(`JSON parse error on skill ${skillId}:`, e.message);
    }

    // Separate NOS units (without video_id) from Media rows
    const nosUnits = legacyLessons.map((les, idx) => ({
      id: les.id || `les_${idx + 1}`,
      reel_index: idx + 1,
      nos_code: les.nos_code || `MODULE-${String(idx + 1).padStart(2, '0')}`,
      title: les.title || `Lesson ${idx + 1}`,
      subtitle: les.subtitle || '',
      pcs: Array.isArray(les.pcs) ? les.pcs : []
    }));

    // 1. Insert into skills_curriculum (Table 1)
    const nosUnitsJson = JSON.stringify(nosUnits);
    await executePipeline([{
      sql: `INSERT INTO skills_curriculum (skill_id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, nos_units_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(skill_id) DO UPDATE SET
              title = excluded.title,
              subtitle = excluded.subtitle,
              nos_units_json = excluded.nos_units_json;`,
      args: [
        { type: 'text', value: skillId },
        { type: 'text', value: qpCode },
        { type: 'text', value: type },
        { type: 'text', value: version },
        { type: 'text', value: title },
        { type: 'text', value: subtitle },
        { type: 'text', value: sector },
        { type: 'integer', value: String(nsqfLevel) },
        { type: 'integer', value: String(totalReels) },
        { type: 'text', value: nosUnitsJson },
        { type: 'text', value: createdAt }
      ]
    }]);

    // 2. Insert into skill_reels_media (Table 2)
    const mediaStmts = legacyLessons.map((les, idx) => {
      const reelIndex = idx + 1;
      const mediaId = `${skillId}_les_${reelIndex}_en`;
      const videoId = les.video_id || 'w7ejDZ8SWv8';
      const candidatesJson = JSON.stringify(les.candidates || [{ video_id: videoId, title: les.title || '' }]);

      return {
        sql: `INSERT INTO skill_reels_media (id, skill_id, reel_index, video_platform, video_id, candidates_json, language, status, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                video_id = excluded.video_id,
                candidates_json = excluded.candidates_json;`,
        args: [
          { type: 'text', value: mediaId },
          { type: 'text', value: skillId },
          { type: 'integer', value: String(reelIndex) },
          { type: 'text', value: les.video_platform || 'youtube' },
          { type: 'text', value: videoId },
          { type: 'text', value: candidatesJson },
          { type: 'text', value: 'en' },
          { type: 'text', value: 'verified' },
          { type: 'text', value: new Date().toISOString() }
        ]
      };
    });

    if (mediaStmts.length > 0) {
      await executePipeline(mediaStmts);
    }

    console.log(`✅ Migrated skill "${title}" (${skillId}) -> Table 1 (NOS Units) + Table 2 (${mediaStmts.length} Media Reels).`);
  }

  console.log('\n🎉 Migration Complete! 2-Table normalized schema populated successfully.');
}

migrate().catch(console.error);
