/**
 * Turso Edge DB Schema Creation & Complete Seeding Script
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
    id: "HSS/Q5101",
    qp_code: "HSS/Q5101",
    type: "nsqf_official",
    version: "3.0",
    title: "General Duty Assistant (GDA)",
    subtitle: "Government Approved NSQF QP for patient care, vital signs monitoring, and hospital ward procedures",
    sector: "Healthcare",
    nsqf_level: 3,
    total_reels: 11,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "les_1", nos_code: "HSS/N5101", title: "Patient Vital Signs Measurement", subtitle: "Checking BP, pulse, temperature, and SpO2 saturation", video_id: "tXXgjbB7pmI", pcs: ["PC1. Wash hands using WHO 7-step method", "PC2. Prepare digital BP monitor", "PC3. Record readings in chart"] },
      { id: "les_2", nos_code: "HSS/N5101", title: "Patient Hygiene & Bed Bath Protocol", subtitle: "Assisting bedridden patients with daily hygiene and linen change", video_id: "NelPI2MHwbQ", pcs: ["PC4. Maintain patient dignity and privacy", "PC5. Prepare warm water basin", "PC6. Change bed linen safely"] },
      { id: "les_3", nos_code: "HSS/N5102", title: "Wheelchair & Stretcher Patient Transfer", subtitle: "Safe ergonomics for moving patients between bed and chair", video_id: "Vk6d0lzAtaQ", pcs: ["PC7. Lock wheelchair brakes", "PC8. Apply gait safety belt", "PC9. Transfer patient smoothly"] },
      { id: "les_4", nos_code: "HSS/N5102", title: "Infection Control & PPE Donning/Doffing", subtitle: "Proper sequence for gloves, mask, gown, and face shield", video_id: "tXXgjbB7pmI", pcs: ["PC10. Don gown and N95 mask", "PC11. Doff PPE in safe order"] },
      { id: "les_5", nos_code: "HSS/N5103", title: "Bio-Medical Waste Segregation", subtitle: "Color-coded bin disposal (Yellow, Red, Blue, Black)", video_id: "NelPI2MHwbQ", pcs: ["PC12. Dispose infectious waste in Yellow bin", "PC13. Dispose sharps in Blue container"] },
      { id: "les_6", nos_code: "HSS/N5103", title: "Patient Feeding & Nutrition Support", subtitle: "Assisting semi-fowler position feeding and fluid tracking", video_id: "Vk6d0lzAtaQ", pcs: ["PC14. Elevate bed head 45 degrees", "PC15. Record fluid intake/output"] },
      { id: "les_7", nos_code: "HSS/N5104", title: "Surgical Ward Preparation & Sterilization", subtitle: "Disinfecting ward equipment and autoclaved tray prep", video_id: "tXXgjbB7pmI", pcs: ["PC16. Wipe surfaces with disinfectant", "PC17. Inspect autoclave indicator tape"] },
      { id: "les_8", nos_code: "HSS/N5104", title: "Basic First Aid & Emergency CPR Support", subtitle: "Chest compressions and alert protocol for Code Blue", video_id: "NelPI2MHwbQ", pcs: ["PC18. Assess patient responsiveness", "PC19. Call Code Blue and initiate CPR"] },
      { id: "les_9", nos_code: "HSS/N5105", title: "Specimen Collection & Lab Transport", subtitle: "Labeling blood and urine vials and safe transport box", video_id: "Vk6d0lzAtaQ", pcs: ["PC20. Verify patient ID on sample tube", "PC21. Transport samples in sealed container"] },
      { id: "les_10", nos_code: "HSS/N5105", title: "Fall Prevention & Ward Safety", subtitle: "Bed rail safety, call button placement, and spill cleanup", video_id: "tXXgjbB7pmI", pcs: ["PC22. Elevate bed side rails", "PC23. Place call bell in patient reach"] },
      { id: "les_11", nos_code: "HSS/N5105", title: "Nursing Shift Handover & Charting", subtitle: "Accurate logging of patient notes for incoming shift", video_id: "NelPI2MHwbQ", pcs: ["PC24. Update vital sign flow sheet", "PC25. Verbal handover to staff nurse"] }
    ]
  },
  {
    id: "SSC/Q0501",
    qp_code: "SSC/Q0501",
    type: "nsqf_official",
    version: "2.0",
    title: "Web & Front-End Software Developer",
    subtitle: "Government Approved NSQF QP for responsive web interfaces, JS logic, and web APIs",
    sector: "IT-ITeS",
    nsqf_level: 5,
    total_reels: 11,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "les_1", nos_code: "SSC/N0501", title: "DOM Manipulation & State Management", subtitle: "Creating dynamic UI components using modern JavaScript", video_id: "Vk6d0lzAtaQ", pcs: ["PC1. Structure HTML5 semantic tags", "PC2. Apply CSS Flexbox & Grid", "PC3. Implement async fetch API"] },
      { id: "les_2", nos_code: "SSC/N0501", title: "Responsive Web Layouts & CSS Media Queries", subtitle: "Building mobile-first adaptive web designs", video_id: "tXXgjbB7pmI", pcs: ["PC4. Design viewport breakpoints", "PC5. Optimize fluid typography and spacing"] },
      { id: "les_3", nos_code: "SSC/N0502", title: "JavaScript Async/Await & REST API Integration", subtitle: "Fetching JSON data and handling network errors", video_id: "NelPI2MHwbQ", pcs: ["PC6. Construct fetch requests with try-catch", "PC7. Parse JSON payloads into state"] },
      { id: "les_4", nos_code: "SSC/N0502", title: "Git Version Control & Branch Management", subtitle: "Git commits, pull requests, and resolving merge conflicts", video_id: "Vk6d0lzAtaQ", pcs: ["PC8. Initialize Git workspace", "PC9. Create feature branches and merge"] },
      { id: "les_5", nos_code: "SSC/N0503", title: "Web Accessibility (WCAG 2.1) & ARIA Attributes", subtitle: "Ensuring screen reader support and keyboard navigation", video_id: "tXXgjbB7pmI", pcs: ["PC10. Add aria-labels to interactive elements", "PC11. Verify contrast ratio > 4.5:1"] },
      { id: "les_6", nos_code: "SSC/N0503", title: "Web Performance Optimization & CWV", subtitle: "Minimizing LCP, INP, CLS, and lazy loading images", video_id: "NelPI2MHwbQ", pcs: ["PC12. Compress web assets", "PC13. Audit page speed via Lighthouse"] },
      { id: "les_7", nos_code: "SSC/N0504", title: "Client-Side Form Validation & Security", subtitle: "Sanitizing user inputs and preventing XSS attacks", video_id: "Vk6d0lzAtaQ", pcs: ["PC14. Validate regex email patterns", "PC15. Escape HTML input parameters"] },
      { id: "les_8", nos_code: "SSC/N0504", title: "Local State & IndexedDB Storage Caching", subtitle: "Persisting offline PWA app data in client storage", video_id: "tXXgjbB7pmI", pcs: ["PC16. Store user session in localStorage", "PC17. Implement IndexedDB offline cache"] },
      { id: "les_9", nos_code: "SSC/N0505", title: "Progressive Web App (PWA) Service Worker", subtitle: "Service worker registration and manifest file setup", video_id: "NelPI2MHwbQ", pcs: ["PC18. Register service worker lifecycle", "PC19. Configure manifest.json display"] },
      { id: "les_10", nos_code: "SSC/N0505", title: "Unit Testing & Component Debugging", subtitle: "Writing test suites and debugging via Chrome DevTools", video_id: "Vk6d0lzAtaQ", pcs: ["PC20. Set breakpoints in Chrome DevTools", "PC21. Run component assertions"] },
      { id: "les_11", nos_code: "SSC/N0505", title: "Production Deployment & Cloud Hosting", subtitle: "Deploying production build artifacts to Cloudflare Pages", video_id: "tXXgjbB7pmI", pcs: ["PC22. Build production assets", "PC23. Verify HTTPS SSL certificate"] }
    ]
  },
  {
    id: "LSC/Q1101",
    qp_code: "LSC/Q1101",
    type: "nsqf_official",
    version: "2.0",
    title: "Warehouse Inventory Clerk",
    subtitle: "Government Approved NSQF QP for barcode scanning, stock auditing, and inventory control",
    sector: "Logistics",
    nsqf_level: 3,
    total_reels: 11,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "les_1", nos_code: "LSC/N1101", title: "Inbound Stock Receiving & Barcode Verification", subtitle: "Scanning incoming shipment pallets and logging SKU IDs", video_id: "tXXgjbB7pmI", pcs: ["PC1. Scan RFID/barcode tags", "PC2. Match received stock with purchase order"] },
      { id: "les_2", nos_code: "LSC/N1101", title: "Pallet Racking & Bin Location Staging", subtitle: "Organizing inventory by shelf codes and velocity tiers", video_id: "NelPI2MHwbQ", pcs: ["PC3. Assign bin location in WMS", "PC4. Stack fast-moving items near dock"] },
      { id: "les_3", nos_code: "LSC/N1102", title: "Cycle Counting & Physical Stock Audit", subtitle: "Conducting perpetual inventory counts and variance tracking", video_id: "Vk6d0lzAtaQ", pcs: ["PC5. Perform daily cycle count", "PC6. Report inventory discrepancies"] },
      { id: "les_4", nos_code: "LSC/N1102", title: "Pick List Processing & Order Packing", subtitle: "Fulfilling customer orders with voice/scan picking tools", video_id: "tXXgjbB7pmI", pcs: ["PC7. Generate order pick list", "PC8. Pack items into corrugated boxes"] },
      { id: "les_5", nos_code: "LSC/N1103", title: "Hazardous Materials (HAZMAT) Storage", subtitle: "Segregating flammables and chemicals per MSDS guidelines", video_id: "NelPI2MHwbQ", pcs: ["PC9. Review MSDS safety sheets", "PC10. Store chemicals in vented cages"] },
      { id: "les_6", nos_code: "LSC/N1103", title: "Forklift & Hydraulic Pallet Truck Safety", subtitle: "Operating electric stackers and manual pallet jacks", video_id: "Vk6d0lzAtaQ", pcs: ["PC11. Inspect hydraulic fluid levels", "PC12. Maintain 5km/h aisle speed limit"] },
      { id: "les_7", nos_code: "LSC/N1104", title: "Outbound Dispatch & Shipping Manifests", subtitle: "Securing truck loads and printing bills of lading", video_id: "tXXgjbB7pmI", pcs: ["PC13. Print shipping labels", "PC14. Handover manifest to freight driver"] },
      { id: "les_8", nos_code: "LSC/N1104", title: "Damaged Goods & Return Merchandise (RMA)", subtitle: "Processing customer returns and quarantine inspection", video_id: "NelPI2MHwbQ", pcs: ["PC15. Log RMA reason in system", "PC16. Move damaged items to quarantine zone"] },
      { id: "les_9", nos_code: "LSC/N1105", title: "Warehouse ERP System Data Entry", subtitle: "Updating SAP/WMS inventory balances in real time", video_id: "Vk6d0lzAtaQ", pcs: ["PC17. Input stock adjustments", "PC18. Export daily inventory summary"] },
      { id: "les_10", nos_code: "LSC/N1105", title: "Cleanliness & 5S Workplace Organization", subtitle: "Applying Sort, Set in Order, Shine, Standardize, Sustain", video_id: "tXXgjbB7pmI", pcs: ["PC19. Sweep warehouse aisles", "PC20. Keep emergency exits clear"] },
      { id: "les_11", nos_code: "LSC/N1105", title: "End-of-Day Dock Lockout & Audit", subtitle: "Securing warehouse loading bays and locking dock doors", video_id: "NelPI2MHwbQ", pcs: ["PC21. Engage dock leveler locks", "PC22. Verify security alarm system"] }
    ]
  },
  {
    id: "ELE/Q3101",
    qp_code: "ELE/Q3101",
    type: "nsqf_official",
    version: "2.0",
    title: "Solar Panel & Rooftop PV Installer",
    subtitle: "Government Approved NSQF QP for solar module mounting, inverter wiring, and grid synchronization",
    sector: "Electronics",
    nsqf_level: 4,
    total_reels: 11,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "les_1", nos_code: "ELE/N3101", title: "Rooftop Solar Site Survey & Tilt Calculation", subtitle: "Measuring shadow-free roof area and optimal tilt angles", video_id: "Vk6d0lzAtaQ", pcs: ["PC1. Measure roof azimuth angle", "PC2. Calculate solar tilt angle for latitude"] },
      { id: "les_2", nos_code: "ELE/N3101", title: "Solar Mounting Structure & Anchor Installation", subtitle: "Fixing aluminum rails and weather-proofing roof anchors", video_id: "tXXgjbB7pmI", pcs: ["PC3. Drill roof anchor points", "PC4. Apply waterproof sealant around bolts"] },
      { id: "les_3", nos_code: "ELE/N3102", title: "Solar PV Module Mounting & Interconnection", subtitle: "Securing solar panels with mid-clamps and MC4 connectors", video_id: "NelPI2MHwbQ", pcs: ["PC5. Fasten PV module clamps", "PC6. Crimp MC4 solar connectors"] },
      { id: "les_4", nos_code: "ELE/N3102", title: "DC Combiner Box & Surge Protection (SPD)", subtitle: "Wiring DC fuses, isolator switches, and surge arrestors", video_id: "Vk6d0lzAtaQ", pcs: ["PC7. Wire DC surge protection device", "PC8. Install DC rotary isolator switch"] },
      { id: "les_5", nos_code: "ELE/N3103", title: "Solar String Inverter Mounting & Wiring", subtitle: "Connecting DC solar strings to inverter input terminals", video_id: "tXXgjbB7pmI", pcs: ["PC9. Mount inverter on shaded wall", "PC10. Connect DC cables to MPPT tracker"] },
      { id: "les_6", nos_code: "ELE/N3103", title: "AC Distribution Board & Net Metering Sync", subtitle: "Connecting AC output to bidirectional grid meter", video_id: "NelPI2MHwbQ", pcs: ["PC11. Connect AC circuit breaker", "PC12. Wire bidirectional net meter"] },
      { id: "les_7", nos_code: "ELE/N3104", title: "System Grounding & Lightning Arrestor Setup", subtitle: "Installing copper earth pits and grounding PV array frame", video_id: "Vk6d0lzAtaQ", pcs: ["PC13. Drive copper earth electrode", "PC14. Bond solar structure to ground pit"] },
      { id: "les_8", nos_code: "ELE/N3104", title: "Solar Battery Storage Bank Connection", subtitle: "Wiring Lithium-ion / Tubular battery storage units", video_id: "tXXgjbB7pmI", pcs: ["PC15. Connect battery BMS communications", "PC16. Set battery charge parameters"] },
      { id: "les_9", nos_code: "ELE/N3105", title: "PV System Commissioning & Voltage Testing", subtitle: "Measuring open circuit voltage (Voc) and short circuit current (Isc)", video_id: "NelPI2MHwbQ", pcs: ["PC17. Measure string Voc with multimeter", "PC18. Verify inverter grid sync LED"] },
      { id: "les_10", nos_code: "ELE/N3105", title: "Solar Monitoring App & Wi-Fi Gateway Setup", subtitle: "Pairing inverter Wi-Fi dongle to cloud portal", video_id: "Vk6d0lzAtaQ", pcs: ["PC19. Configure Wi-Fi monitoring dongle", "PC20. Verify live power graph on mobile app"] },
      { id: "les_11", nos_code: "ELE/N3105", title: "Maintenance & Roof Safety Audit", subtitle: "Routine cleaning and annual thermal inspection", video_id: "tXXgjbB7pmI", pcs: ["PC21. Clean glass panels", "PC22. Inspect thermal hotspot anomalies"] }
    ]
  },
  {
    id: "CUSTOM-CAR_DRIVING-1001",
    qp_code: "CUSTOM-CAR_DRIVING",
    type: "custom_ai",
    version: "1.0",
    title: "Car Driving",
    subtitle: "AI-Curated 11-Reel Skill Module for Car Driving",
    sector: "Custom Micro-Learning",
    nsqf_level: 3,
    total_reels: 11,
    created_at: new Date().toISOString(),
    lessons: [
      { id: "les_1", nos_code: "SEC2/N0101", title: "Reel 1: How to Drive a Car - Beginner Controls", subtitle: "Mastering Cockpit Controls & Dashboard Gauges", video_id: "N-XpM10QG0k", pcs: ["PC1. Review safety standards for Car Driving.", "PC2. Adjust seat, side mirrors, and rearview mirror.", "PC3. Understand dashboard indicators and warning lights.", "PC4. Perform pre-drive safety belt check."] },
      { id: "les_2", nos_code: "SEC2/N0102", title: "Reel 2: Clutch, Accelerator & Brake Pedal Mastery", subtitle: "Pedal Positioning & Smooth Footwork", video_id: "lK2w8R_z_L0", pcs: ["PC1. Identify clutch, brake, and accelerator pedals.", "PC2. Practice bite-point control on clutch pedal.", "PC3. Execute gradual acceleration without stalling.", "PC4. Practice smooth brake pressure for gentle stops."] },
      { id: "les_3", nos_code: "SEC2/N0103", title: "Reel 3: Smooth Gear Shifting & Neutral Control", subtitle: "Manual & Automatic Transmission Operations", video_id: "a9j1fXn0Gvw", pcs: ["PC1. Shift gears cleanly through H-pattern gear stick.", "PC2. Match engine RPM with gear selection.", "PC3. Execute downshifting before turns.", "PC4. Return gear to Neutral when stationary."] },
      { id: "les_4", nos_code: "SEC2/N0201", title: "Reel 4: Moving Off & Stopping Smoothly", subtitle: "Controlled Takeoff & Safe Stopping Distance", video_id: "9VbS3h12a8A", pcs: ["PC1. Check blind spots before pulling out.", "PC2. Signal turn indicator prior to moving off.", "PC3. Release handbrake smoothly at clutch bite point.", "PC4. Stop vehicle within designated stopping zone."] },
      { id: "les_5", nos_code: "SEC2/N0202", title: "Reel 5: Steering Technique Push-Pull Method", subtitle: "Precise Steering Wheel Control & Turning", video_id: "y3yQx17A8lI", pcs: ["PC1. Hold steering wheel at 9 and 3 o'clock position.", "PC2. Execute push-pull steering method on sharp turns.", "PC3. Avoid dry steering while vehicle is stationary.", "PC4. Return steering wheel smoothly after completing turn."] },
      { id: "les_6", nos_code: "SEC2/N0203", title: "Reel 6: Slope & Hill Start Handbrake Control", subtitle: "Preventing Rollback on Inclines", video_id: "8s68gT30u9w", pcs: ["PC1. Apply handbrake when stopping on incline.", "PC2. Find clutch bite point until bonnet lifts slightly.", "PC3. Apply light accelerator pressure.", "PC4. Release handbrake smoothly without backward roll."] },
      { id: "les_7", nos_code: "SEC2/N0301", title: "Reel 7: Reversing Driving & 3-Point Turn", subtitle: "Reverse Steering & Narrow Street Maneuvers", video_id: "4o98F7tXkQA", pcs: ["PC1. Look over shoulder and check all mirrors before reversing.", "PC2. Use slow clutch control during reverse motion.", "PC3. Turn steering wheel opposite to desired rear direction.", "PC4. Complete 3-point turn safely without hitting curb."] },
      { id: "les_8", nos_code: "SEC2/N0401", title: "Reel 8: Parallel Parking & Bay Parking Step-by-Step", subtitle: "Precision Tight Space Parking", video_id: "2b694Zq4oJg", pcs: ["PC1. Align vehicle parallel with reference car.", "PC2. Reverse at 45-degree angle checking rear clearance.", "PC3. Lock steering wheel towards curb.", "PC4. Straighten wheels and center car within parking bay."] },
      { id: "les_9", nos_code: "SEC2/N0402", title: "Reel 9: Navigating Roundabouts & Traffic Signals", subtitle: "Junction Rules & Lane Priority", video_id: "xLp7V4aQx48", pcs: ["PC1. Give way to traffic from right on roundabouts.", "PC2. Indicate left when exiting roundabout.", "PC3. Obey traffic light signals and road markings.", "PC4. Maintain safe follow distance behind lead vehicle."] },
      { id: "les_10", nos_code: "SEC2/N0501", title: "Reel 10: Highway Driving & Lane Discipline", subtitle: "High Speed Cruising & Safe Overtaking", video_id: "p1z_4O8q9rE", pcs: ["PC1. Merge onto highway matching traffic speed.", "PC2. Use mirrors and indicate before changing lanes.", "PC3. Maintain 3-second safety gap behind vehicles.", "PC4. Execute overtaking on designated right lane."] },
      { id: "les_11", nos_code: "SEC2/N0502", title: "Reel 11: Pre-Drive Safety Inspection & Rules", subtitle: "Tire Pressure, Fluids & Emergency Protocols", video_id: "q_6z9e8t4y0", pcs: ["PC1. Check tire tread depth and air pressure.", "PC2. Inspect engine coolant, brake fluid, and oil level.", "PC3. Verify hazard lights and brake light functionality.", "PC4. Keep emergency warning triangle and first aid kit."] }
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
      { id: "les_1", nos_code: "SEC2/N0101", title: "Reel 1: Growing Basil from Seeds & Cuttings", subtitle: "Germination & Seedling Nursery Management", video_id: "8mJk604tK4E", pcs: ["PC1. Review safety standards for Basil Plantation.", "PC2. Select high-quality sweet basil seeds or stem cuttings.", "PC3. Prepare potting tray with well-draining soil mix.", "PC4. Monitor seed germination temperature (20-25°C)."] },
      { id: "les_2", nos_code: "SEC2/N0102", title: "Reel 2: Soil Mix & Container Preparation", subtitle: "pH Balance, Compost & Drainage Setup", video_id: "o3vYmKzJgL0", pcs: ["PC1. Prepare rich organic soil mix with vermicompost.", "PC2. Test soil pH level (optimal 6.0 to 7.5).", "PC3. Ensure adequate drainage holes in planter containers.", "PC4. Apply organic neem cake for root protection."] },
      { id: "les_3", nos_code: "SEC2/N0103", title: "Reel 3: Watering Schedule & Sunlight Requirements", subtitle: "Irrigation & Full Sun Exposure", video_id: "a9j1fXn0Gvw", pcs: ["PC1. Provide 6-8 hours of direct daily sunlight.", "PC2. Water basil plants deeply when top inch of soil dries.", "PC3. Avoid overhead watering to prevent leaf fungus.", "PC4. Inspect leaf turgidity and moisture levels."] },
      { id: "les_4", nos_code: "SEC2/N0201", title: "Reel 4: Organic Pest Control & Companion Planting", subtitle: "Aphid Prevention & Natural Repellents", video_id: "9VbS3h12a8A", pcs: ["PC1. Inspect underside of leaves for aphids and spider mites.", "PC2. Spray organic neem oil solution for pest prevention.", "PC3. Plant companion crops like tomatoes and marigolds.", "PC4. Maintain adequate spacing for air circulation."] },
      { id: "les_5", nos_code: "SEC2/N0202", title: "Reel 5: Pruning & Pinching Basil for Bushy Growth", subtitle: "Stem Pinching & Flower Bud Removal", video_id: "y3yQx17A8lI", pcs: ["PC1. Pinch off top central stem above second leaf node.", "PC2. Remove premature flower buds to extend leaf growth.", "PC3. Encourage lateral side-branching.", "PC4. Maintain clean pruning scissors."] },
      { id: "les_6", nos_code: "SEC2/N0203", title: "Reel 6: Harvesting Basil Leaves for Maximum Yield", subtitle: "Morning Harvesting & Selective Leaf Picking", video_id: "8s68gT30u9w", pcs: ["PC1. Harvest leaves in early morning when essential oils peak.", "PC2. Pick outer mature leaves from top downwards.", "PC3. Leave bottom leaves intact for photosynthesis.", "PC4. Wash harvested leaves gently in cold water."] },
      { id: "les_7", nos_code: "SEC2/N0301", title: "Reel 7: Hydroponic & Indoor Basil Setup", subtitle: "Nutrient Solution & LED Grow Lights", video_id: "4o98F7tXkQA", pcs: ["PC1. Set up DWC hydroponic tank or NFT channels.", "PC2. Calibrate EC and PPM nutrient solution levels.", "PC3. Position full-spectrum LED grow lights 12 inches above canopy.", "PC4. Monitor water oxygenation with air pump."] },
      { id: "les_8", nos_code: "SEC2/N0401", title: "Reel 8: Seedling Transplanting & Spacing Technique", subtitle: "Outdoor Bed Preparation & Spacing", video_id: "2b694Zq4oJg", pcs: ["PC1. Harden off indoor seedlings before transplanting.", "PC2. Space basil plants 12-18 inches apart in raised beds.", "PC3. Mulch bed surface to conserve soil moisture.", "PC4. Water thoroughly immediately after transplanting."] },
      { id: "les_9", nos_code: "SEC2/N0402", title: "Reel 9: Commercial Herb Plantation & Irrigation", subtitle: "Drip Lines & Fertigation System", video_id: "xLp7V4aQx48", pcs: ["PC1. Install micro-drip irrigation lines.", "PC2. Schedule automated fertigation for organic liquid kelp.", "PC3. Monitor field moisture with soil sensors.", "PC4. Conduct weekly crop health walk."] },
      { id: "les_10", nos_code: "SEC2/N0501", title: "Reel 10: Post-Harvest Drying & Storage Methods", subtitle: "Air Drying, Freezing & Essential Oil Preservation", video_id: "p1z_4O8q9rE", pcs: ["PC1. Bundle basil stems and hang in dark ventilated room.", "PC2. Strip dried leaves and store in airtight glass jars.", "PC3. Freeze fresh leaves in olive oil ice trays.", "PC4. Label batches with harvest date and variety."] },
      { id: "les_11", nos_code: "SEC2/N0502", title: "Reel 11: Disease Inspection & Root Health Maintenance", subtitle: "Fusarium Wilt & Downy Mildew Prevention", video_id: "q_6z9e8t4y0", pcs: ["PC1. Inspect roots for root-knot nematodes and rot.", "PC2. Identify downy mildew yellowing on upper leaves.", "PC3. Remove infected plants to prevent field spread.", "PC4. Practice crop rotation with non-lamiaceae species."] }
    ]
  }
];

async function seedDatabase() {
  console.log('🚀 Initializing Turso Edge Database Setup & Complete Seeding...');

  // 1. Create Tables
  const createTablesSql = [
    `CREATE TABLE IF NOT EXISTS curricula (
      id TEXT PRIMARY KEY,
      qp_code TEXT,
      type TEXT,
      version TEXT,
      title TEXT,
      subtitle TEXT,
      sector TEXT,
      nsqf_level INTEGER,
      total_reels INTEGER,
      lessons_json TEXT,
      created_at TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS employer_packages (
      package_id TEXT PRIMARY KEY,
      employer_id TEXT,
      company_name TEXT,
      target_role TEXT,
      curriculum_id TEXT,
      instructor_note TEXT,
      share_code TEXT,
      created_at TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS content_reports (
      report_id TEXT PRIMARY KEY,
      package_id TEXT,
      reason TEXT,
      timestamp TEXT
    );`
  ];

  console.log('📦 Creating database tables (curricula, employer_packages, content_reports)...');
  const tableRes = await executePipeline(createTablesSql);
  console.log('✅ Tables Created Successfully:', JSON.stringify(tableRes.results[0].type));

  // 2. Insert Curricula Rows
  const insertStmts = OFFICIAL_QPS.map(qp => ({
    sql: `INSERT INTO curricula (id, qp_code, type, version, title, subtitle, sector, nsqf_level, total_reels, lessons_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            subtitle = excluded.subtitle,
            sector = excluded.sector,
            lessons_json = excluded.lessons_json;`,
    args: [
      { type: 'text', value: qp.id },
      { type: 'text', value: qp.qp_code || qp.id },
      { type: 'text', value: qp.type },
      { type: 'text', value: qp.version || '1.0' },
      { type: 'text', value: qp.title },
      { type: 'text', value: qp.subtitle },
      { type: 'text', value: qp.sector },
      { type: 'integer', value: String(qp.nsqf_level || 3) },
      { type: 'integer', value: String(qp.total_reels || 11) },
      { type: 'text', value: JSON.stringify(qp.lessons) },
      { type: 'text', value: qp.created_at }
    ]
  }));

  console.log(`📥 Inserting ${OFFICIAL_QPS.length} Curricula Packages into Turso Edge DB...`);
  const seedRes = await executePipeline(insertStmts);
  console.log(`✅ ${OFFICIAL_QPS.length} Skill Packs Seeded into Turso DB successfully!`);

  // 3. Verify inserted records
  const verifyRes = await executePipeline([{ sql: "SELECT id, title, sector, total_reels FROM curricula;" }]);
  const rows = verifyRes.results[0].response.result.rows;
  console.log('\n📊 Turso Edge Database Live Records:');
  rows.forEach((r, idx) => {
    console.log(`  [${idx + 1}] ${r[0].value} - "${r[1].value}" (${r[2].value}) | ${r[3].value} Reels`);
  });
}

seedDatabase().catch(err => {
  console.error('❌ Seeding Error:', err);
});
