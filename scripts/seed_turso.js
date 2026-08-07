/**
 * Turso Edge DB 2-Table Normalized Schema Seeding Script
 * Table 1: skills_curriculum (Immutable Educational NOS Units & PCs)
 * Table 2: skill_reels_media (Dynamic Video Sources & Candidates)
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

const OFFICIAL_QPS = [
  {
    id: "AAS/Q0103",
    qp_code: "AAS/Q0103",
    type: "nsqf_official",
    version: "3.0",
    title: "Airline Cargo Assistant",
    subtitle: "Government Approved NSQF QP for receiving, inspecting, staging, and releasing air cargo",
    sector: "Aerospace & Aviation",
    nsqf_level: 3,
    total_reels: 11,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "les_1", nos_code: "AAS/N0101", title: "Aircraft Arrival & Cargo Receiving", subtitle: "Receiving incoming air cargo at aircraft ramp & warehouse transport", video_id: "tXXgjbB7pmI", pcs: ["PC1. Gather info on incoming cargo volume", "PC2. Deploy dollies and forklifts", "PC3. Receive incoming cargo and air waybill", "PC4. Transport cargo safely to warehouse"] },
      { id: "les_2", nos_code: "AAS/N0101", title: "Cargo Breakdown & Air Waybill Inspection", subtitle: "Segregation of consignments and visual damage verification", video_id: "NelPI2MHwbQ", pcs: ["PC5. Breakdown cargo from pallets", "PC6. Verify AWB numbers against manifest", "PC7. Visually inspect cargo for damage"] },
      { id: "les_3", nos_code: "AAS/N0101", title: "Delivery Order & Recipient Cargo Release", subtitle: "System updates, DO issuance, and recipient handover", video_id: "Vk6d0lzAtaQ", pcs: ["PC8. Update cargo management system", "PC9. Create Delivery Order (DO)", "PC10. Handover cargo to recipient"] },
      { id: "les_4", nos_code: "AAS/N0102", title: "Dangerous Goods Handling & Safety Audit", subtitle: "HAZMAT verification and safe ramp handling", video_id: "tXXgjbB7pmI", pcs: ["PC11. Check UN dangerous goods labels", "PC12. Verify IATA HAZMAT compliance"] },
      { id: "les_5", nos_code: "AAS/N0102", title: "Cold Chain Storage & Perishable Logistics", subtitle: "Temperature control and cold storage staging", video_id: "NelPI2MHwbQ", pcs: ["PC13. Monitor cold room temperature", "PC14. Verify pharmaceutical seal tags"] },
      { id: "les_6", nos_code: "AAS/N0502", title: "ULD Unit Load Device Inspection & Palletizing", subtitle: "Building ULD pallets and net tie-down safety", video_id: "Vk6d0lzAtaQ", pcs: ["PC15. Inspect ULD container locks", "PC16. Secure cargo with tie-down nets"] },
      { id: "les_7", nos_code: "AAS/N0502", title: "Customs Clearance & Import Documentation", subtitle: "Interfacing with airport customs and duty seals", video_id: "tXXgjbB7pmI", pcs: ["PC17. Inspect customs seals", "PC18. File entry manifests"] },
      { id: "les_8", nos_code: "AAS/N0702", title: "Forklift Safety & Heavy Cargo Towing", subtitle: "Safe forklift operation on airfield ramps", video_id: "NelPI2MHwbQ", pcs: ["PC19. Conduct pre-op forklift checklist", "PC20. Tow heavy cargo at approved speeds"] },
      { id: "les_9", nos_code: "AAS/N0702", title: "Cargo Security Scanning & X-Ray Protocols", subtitle: "Screening air cargo for prohibited contraband", video_id: "Vk6d0lzAtaQ", pcs: ["PC21. Pass boxes through X-ray tunnel", "PC22. Report density anomalies to security"] },
      { id: "les_10", nos_code: "AAS/N0702", title: "Airfield Ramp Safety & PPE Compliance", subtitle: "High-visibility gear, ear protection, and FOD clearance", video_id: "tXXgjbB7pmI", pcs: ["PC23. Wear high-vis vest and ear defenders", "PC24. Inspect ramp area for FOD hazards"] },
      { id: "les_11", nos_code: "AAS/N0702", title: "Shift Handover & Logistics Reporting", subtitle: "Final log entry, shift handover, and inventory sync", video_id: "NelPI2MHwbQ", pcs: ["PC25. Log shift totals in ERP system", "PC26. Complete supervisor handover checklist"] }
    ]
  },
  {
    id: "ASC/Q1402",
    qp_code: "ASC/Q1402",
    type: "nsqf_official",
    version: "2.0",
    title: "Automotive Service Technician",
    subtitle: "Government Approved NSQF QP for routine servicing, OBD diagnostics, and engine overhaul",
    sector: "Automotive",
    nsqf_level: 4,
    total_reels: 11,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "les_1", nos_code: "ASC/N1401", title: "Vehicle Inspection & OBD Diagnostics", subtitle: "Connecting scanner tools and reading diagnostic codes", video_id: "N-XpM10QG0k", pcs: ["PC1. Inspect engine bay for leaks", "PC2. Connect OBD-II scanner", "PC3. Test battery voltage"] },
      { id: "les_2", nos_code: "ASC/N1401", title: "Engine Oil & Filter Replacement", subtitle: "Draining oil, replacing filter cartridge, refilling engine oil", video_id: "lK2w8R_z_L0", pcs: ["PC4. Elevate vehicle on hydraulic hoist", "PC5. Drain old engine oil", "PC6. Torque oil drain plug to spec"] },
      { id: "les_3", nos_code: "ASC/N1402", title: "Brake System Inspection & Servicing", subtitle: "Rotor turning, brake pad replacement, and bleeding lines", video_id: "a9j1fXn0Gvw", pcs: ["PC7. Measure brake pad thickness", "PC8. Inspect brake disc rotors", "PC9. Bleed hydraulic brake lines"] },
      { id: "les_4", nos_code: "ASC/N1402", title: "Suspension & Steering Alignment", subtitle: "Checking ball joints, tie rods, and 4-wheel alignment", video_id: "y3yQx17A8lI", pcs: ["PC10. Check tie-rod play", "PC11. Calibrate steering angle sensor"] },
      { id: "les_5", nos_code: "ASC/N1403", title: "Transmission Fluid Check & Servicing", subtitle: "Automatic and manual gearbox fluid replacement", video_id: "8s68gT30u9w", pcs: ["PC12. Check transmission fluid level", "PC13. Replace gearbox filter gasket"] },
      { id: "les_6", nos_code: "ASC/N1403", title: "Spark Plug & Ignition Coil Testing", subtitle: "Checking plug gap, coil resistance, and cylinder misfire", video_id: "4o98F7tXkQA", pcs: ["PC14. Measure spark plug gap", "PC15. Test ignition coil resistance"] },
      { id: "les_7", nos_code: "ASC/N1404", title: "Air & Cabin Filter Replacement", subtitle: "Cleaning intake housing and replacing cabin pollen filter", video_id: "2b694Zq4oJg", pcs: ["PC16. Remove engine air filter box", "PC17. Install OEM cabin pollen filter"] },
      { id: "les_8", nos_code: "ASC/N1404", title: "Cooling System Pressure Test", subtitle: "Checking radiator pressure, hoses, and coolant flush", video_id: "xLp7V4aQx48", pcs: ["PC18. Pressurize cooling system", "PC19. Flush radiator coolant"] },
      { id: "les_9", nos_code: "ASC/N1405", title: "Electrical Circuit & Fuse Troubleshooting", subtitle: "Using digital multimeter to check relay switches and fuses", video_id: "p1z_4O8q9rE", pcs: ["PC20. Test blown fuse continuity", "PC21. Measure relay voltage drop"] },
      { id: "les_10", nos_code: "ASC/N1405", title: "Tire Rotation & Wheel Balancing", subtitle: "Balancing weights and checking tire tread depth", video_id: "q_6z9e8t4y0", pcs: ["PC22. Mount wheel on balancer", "PC23. Apply lead balancing weights"] },
      { id: "les_11", nos_code: "ASC/N1405", title: "Final Road Test & Quality Inspection", subtitle: "Completing service job card and customer handover test", video_id: "9VbS3h12a8A", pcs: ["PC24. Perform road test inspection", "PC25. Reset service reminder light"] }
    ]
  },
  {
    id: "CUSTOM-BASIL_PLANTATIO-9420",
    qp_code: "CUSTOM-BASIL_PLANTATIO",
    type: "custom_ai",
    version: "1.0",
    title: "Basil Plantation",
    subtitle: "AI-Curated 11-Reel Skill Module for Basil Plantation & Herb Farming",
    sector: "Custom Micro-Learning",
    nsqf_level: 3,
    total_reels: 11,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "les_1", nos_code: "SEC2/N0101", title: "Reel 1: Growing Basil from Seeds & Cuttings", subtitle: "Germination & Seedling Nursery Management", video_id: "UB1O30fR-EE", pcs: ["PC1. Review safety standards for Basil Plantation.", "PC2. Select high-quality sweet basil seeds or stem cuttings.", "PC3. Prepare potting tray with well-draining soil mix.", "PC4. Monitor seed germination temperature (20-25°C)."] },
      { id: "les_2", nos_code: "SEC2/N0102", title: "Reel 2: Soil Mix & Container Preparation", subtitle: "pH Balance, Compost & Drainage Setup", video_id: "hdI2bqOjy3c", pcs: ["PC1. Prepare rich organic soil mix with vermicompost.", "PC2. Test soil pH level (optimal 6.0 to 7.5).", "PC3. Ensure adequate drainage holes in planter containers.", "PC4. Apply organic neem cake for root protection."] },
      { id: "les_3", nos_code: "SEC2/N0103", title: "Reel 3: Watering Schedule & Sunlight Requirements", subtitle: "Irrigation & Full Sun Exposure", video_id: "1Rs2ND1ryYc", pcs: ["PC1. Provide 6-8 hours of direct daily sunlight.", "PC2. Water basil plants deeply when top inch of soil dries.", "PC3. Avoid overhead watering to prevent leaf fungus.", "PC4. Inspect leaf turgidity and moisture levels."] },
      { id: "les_4", nos_code: "SEC2/N0201", title: "Reel 4: Organic Pest Control & Companion Planting", subtitle: "Aphid Prevention & Natural Repellents", video_id: "w7ejDZ8SWv8", pcs: ["PC1. Inspect underside of leaves for aphids and spider mites.", "PC2. Spray organic neem oil solution for pest prevention.", "PC3. Plant companion crops like tomatoes and marigolds.", "PC4. Maintain adequate spacing for air circulation."] },
      { id: "les_5", nos_code: "SEC2/N0202", title: "Reel 5: Pruning & Pinching Basil for Bushy Growth", subtitle: "Stem Pinching & Flower Bud Removal", video_id: "pQN-pnXPaVg", pcs: ["PC1. Pinch off top central stem above second leaf node.", "PC2. Remove premature flower buds to extend leaf growth.", "PC3. Encourage lateral side-branching.", "PC4. Maintain clean pruning scissors."] },
      { id: "les_6", nos_code: "SEC2/N0203", title: "Reel 6: Harvesting Basil Leaves for Maximum Yield", subtitle: "Morning Harvesting & Selective Leaf Picking", video_id: "mU6anWqZJcc", pcs: ["PC1. Harvest leaves in early morning when essential oils peak.", "PC2. Pick outer mature leaves from top downwards.", "PC3. Leave bottom leaves intact for photosynthesis.", "PC4. Wash harvested leaves gently in cold water."] },
      { id: "les_7", nos_code: "SEC2/N0301", title: "Reel 7: Hydroponic & Indoor Basil Setup", subtitle: "Nutrient Solution & LED Grow Lights", video_id: "4r6WdaY3SOA", pcs: ["PC1. Set up DWC hydroponic tank or NFT channels.", "PC2. Calibrate EC and PPM nutrient solution levels.", "PC3. Position full-spectrum LED grow lights 12 inches above canopy.", "PC4. Monitor water oxygenation with air pump."] },
      { id: "les_8", nos_code: "SEC2/N0401", title: "Reel 8: Seedling Transplanting & Spacing Technique", subtitle: "Outdoor Bed Preparation & Spacing", video_id: "0pThnRneDjw", pcs: ["PC1. Harden off indoor seedlings before transplanting.", "PC2. Space basil plants 12-18 inches apart in raised beds.", "PC3. Mulch bed surface to conserve soil moisture.", "PC4. Water thoroughly immediately after transplanting."] },
      { id: "les_9", nos_code: "SEC2/N0402", title: "Reel 9: Commercial Herb Plantation & Irrigation", subtitle: "Drip Lines & Fertigation System", video_id: "sBws8MSXN7A", pcs: ["PC1. Install micro-drip irrigation lines.", "PC2. Schedule automated fertigation for organic liquid kelp.", "PC3. Monitor field moisture with soil sensors.", "PC4. Conduct weekly crop health walk."] },
      { id: "les_10", nos_code: "SEC2/N0501", title: "Reel 10: Post-Harvest Drying & Storage Methods", subtitle: "Air Drying, Freezing & Essential Oil Preservation", video_id: "nKIu9yen5nc", pcs: ["PC1. Bundle basil stems and hang in dark ventilated room.", "PC2. Strip dried leaves and store in airtight glass jars.", "PC3. Freeze fresh leaves in olive oil ice trays.", "PC4. Label batches with harvest date and variety."] },
      { id: "les_11", nos_code: "SEC2/N0502", title: "Reel 11: Disease Inspection & Root Health Maintenance", subtitle: "Fusarium Wilt & Downy Mildew Prevention", video_id: "tXXgjbB7pmI", pcs: ["PC1. Inspect roots for root-knot nematodes and rot.", "PC2. Identify downy mildew yellowing on upper leaves.", "PC3. Remove infected plants to prevent field spread.", "PC4. Practice crop rotation with non-lamiaceae species."] }
    ]
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding Turso DB using 2-Table Normalized Model...');

  // 1. Create Tables
  const createStmts = [
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

  await executePipeline(createStmts);

  // 2. Insert QPs into Table 1 & Table 2
  for (const qp of OFFICIAL_QPS) {
    const nosUnits = qp.lessons.map((les, idx) => ({
      id: les.id || `les_${idx + 1}`,
      reel_index: idx + 1,
      nos_code: les.nos_code || `MODULE-${String(idx + 1).padStart(2, '0')}`,
      title: les.title || `Lesson ${idx + 1}`,
      subtitle: les.subtitle || '',
      pcs: Array.isArray(les.pcs) ? les.pcs : []
    }));

    const nosUnitsJson = JSON.stringify(nosUnits);

    await executePipeline([{
      sql: `INSERT INTO skills_curriculum (skill_id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, nos_units_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(skill_id) DO UPDATE SET
              title = excluded.title,
              subtitle = excluded.subtitle,
              nos_units_json = excluded.nos_units_json;`,
      args: [
        { type: 'text', value: qp.id },
        { type: 'text', value: qp.qp_code },
        { type: 'text', value: qp.type },
        { type: 'text', value: qp.version },
        { type: 'text', value: qp.title },
        { type: 'text', value: qp.subtitle },
        { type: 'text', value: qp.sector },
        { type: 'integer', value: String(qp.nsqf_level) },
        { type: 'integer', value: String(qp.total_reels) },
        { type: 'text', value: nosUnitsJson },
        { type: 'text', value: qp.created_at }
      ]
    }]);

    const mediaStmts = qp.lessons.map((les, idx) => {
      const reelIndex = idx + 1;
      const mediaId = `${qp.id}_les_${reelIndex}_en`;
      const videoId = les.video_id;
      const candidatesJson = JSON.stringify([{ video_id: videoId, title: les.title }]);

      return {
        sql: `INSERT INTO skill_reels_media (id, skill_id, reel_index, video_platform, video_id, candidates_json, language, status, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                video_id = excluded.video_id,
                candidates_json = excluded.candidates_json;`,
        args: [
          { type: 'text', value: mediaId },
          { type: 'text', value: qp.id },
          { type: 'integer', value: String(reelIndex) },
          { type: 'text', value: 'youtube' },
          { type: 'text', value: videoId },
          { type: 'text', value: candidatesJson },
          { type: 'text', value: 'en' },
          { type: 'text', value: 'verified' },
          { type: 'text', value: new Date().toISOString() }
        ]
      };
    });

    await executePipeline(mediaStmts);
    console.log(`✅ Seeded 2-Table entry for "${qp.title}" (${qp.id})`);
  }

  console.log('🎉 Turso DB 2-Table Seeding Complete!');
}

seedDatabase().catch(console.error);
