const MOCK_QPS = [
  {
    id: "AAS/Q0103",
    qp_code: "AAS/Q0103",
    type: "nsqf_official",
    version: "3.0",
    title: "Airline Cargo Assistant",
    subtitle: "Government Approved NSQF QP for receiving, inspecting, staging, and releasing air cargo",
    sector: "Aerospace & Aviation",
    sub_sector: "Airline Logistics",
    nsqf_level: 3,
    credits: 15.5,
    lessons_count: 11,
    pdf_url: "https://admin.skillindiadigital.gov.in/pdf/AAS_Q0103_v3.0.pdf",
    lessons: [
      { id: 1, nos_code: "AAS/N0101", title: "Aircraft Arrival & Cargo Receiving", subtitle: "Receiving incoming air cargo at aircraft ramp & warehouse transport", video_id: "tXXgjbB7pmI", pcs: ["PC1. Gather info on incoming cargo volume", "PC2. Deploy dollies and forklifts", "PC3. Receive incoming cargo and air waybill", "PC4. Transport cargo safely to warehouse"] },
      { id: 2, nos_code: "AAS/N0101", title: "Cargo Breakdown & Air Waybill Inspection", subtitle: "Segregation of consignments and visual damage verification", video_id: "NelPI2MHwbQ", pcs: ["PC5. Breakdown cargo from pallets", "PC6. Verify AWB numbers against manifest", "PC7. Visually inspect cargo for damage"] },
      { id: 3, nos_code: "AAS/N0101", title: "Delivery Order & Recipient Cargo Release", subtitle: "System updates, DO issuance, and recipient handover", video_id: "Vk6d0lzAtaQ", pcs: ["PC8. Update cargo management system", "PC9. Create Delivery Order (DO)", "PC10. Handover cargo to recipient"] },
      { id: 4, nos_code: "AAS/N0102", title: "Dangerous Goods Handling & Safety Audit", subtitle: "HAZMAT verification and safe ramp handling", video_id: "tXXgjbB7pmI", pcs: ["PC11. Check UN dangerous goods labels", "PC12. Verify IATA HAZMAT compliance"] },
      { id: 5, nos_code: "AAS/N0102", title: "Cold Chain Storage & Perishable Logistics", subtitle: "Temperature control and cold storage staging", video_id: "NelPI2MHwbQ", pcs: ["PC13. Monitor cold room temperature", "PC14. Verify pharmaceutical seal tags"] },
      { id: 6, nos_code: "AAS/N0502", title: "ULD Unit Load Device Inspection & Palletizing", subtitle: "Building ULD pallets and net tie-down safety", video_id: "Vk6d0lzAtaQ", pcs: ["PC15. Inspect ULD container locks", "PC16. Secure cargo with tie-down nets"] },
      { id: 7, nos_code: "AAS/N0502", title: "Customs Clearance & Import Documentation", subtitle: "Interfacing with airport customs and duty seals", video_id: "tXXgjbB7pmI", pcs: ["PC17. Inspect customs seals", "PC18. File entry manifests"] },
      { id: 8, nos_code: "AAS/N0702", title: "Forklift Safety & Heavy Cargo Towing", subtitle: "Safe forklift operation on airfield ramps", video_id: "NelPI2MHwbQ", pcs: ["PC19. Conduct pre-op forklift checklist", "PC20. Tow heavy cargo at approved speeds"] },
      { id: 9, nos_code: "AAS/N0702", title: "Cargo Security Scanning & X-Ray Protocols", subtitle: "Screening air cargo for prohibited contraband", video_id: "Vk6d0lzAtaQ", pcs: ["PC21. Pass boxes through X-ray tunnel", "PC22. Report density anomalies to security"] },
      { id: 10, nos_code: "AAS/N0702", title: "Airfield Ramp Safety & PPE Compliance", subtitle: "High-visibility gear, ear protection, and FOD clearance", video_id: "tXXgjbB7pmI", pcs: ["PC23. Wear high-vis vest and ear defenders", "PC24. Inspect ramp area for FOD hazards"] },
      { id: 11, nos_code: "AAS/N0702", title: "Shift Handover & Logistics Reporting", subtitle: "Final log entry, shift handover, and inventory sync", video_id: "NelPI2MHwbQ", pcs: ["PC25. Log shift totals in ERP system", "PC26. Complete supervisor handover checklist"] }
    ]
  },
  {
    qp_code: "ASC/Q1402",
    version: "2.0",
    title: "Automotive Service Technician",
    subtitle: "Government Approved NSQF QP for routine servicing, OBD diagnostics, and engine overhaul",
    sector: "Automotive",
    sub_sector: "Four Wheeler Service",
    nsqf_level: 4,
    credits: 18.0,
    lessons_count: 11,
    pdf_url: "https://admin.skillindiadigital.gov.in/pdf/ASC_Q1402_v2.0.pdf",
    lessons: [
      { id: 1, nos_code: "ASC/N1401", title: "Vehicle Inspection & OBD Diagnostics", subtitle: "Connecting scanner tools and reading diagnostic codes", video_id: "NelPI2MHwbQ", pcs: ["PC1. Inspect engine bay for leaks", "PC2. Connect OBD-II scanner", "PC3. Test battery voltage"] },
      { id: 2, nos_code: "ASC/N1401", title: "Engine Oil & Filter Replacement", subtitle: "Draining oil, replacing filter cartridge, refilling engine oil", video_id: "Vk6d0lzAtaQ", pcs: ["PC4. Elevate vehicle on hydraulic hoist", "PC5. Drain old engine oil", "PC6. Torque oil drain plug to spec"] },
      { id: 3, nos_code: "ASC/N1402", title: "Brake System Inspection & Servicing", subtitle: "Rotor turning, brake pad replacement, and bleeding lines", video_id: "tXXgjbB7pmI", pcs: ["PC7. Measure brake pad thickness", "PC8. Inspect brake disc rotors", "PC9. Bleed hydraulic brake lines"] },
      { id: 4, nos_code: "ASC/N1402", title: "Suspension & Steering Alignment", subtitle: "Checking ball joints, tie rods, and 4-wheel alignment", video_id: "NelPI2MHwbQ", pcs: ["PC10. Check tie-rod play", "PC11. Calibrate steering angle sensor"] },
      { id: 5, nos_code: "ASC/N1403", title: "Transmission Fluid Check & Servicing", subtitle: "Automatic and manual gearbox fluid replacement", video_id: "Vk6d0lzAtaQ", pcs: ["PC12. Check transmission fluid level", "PC13. Replace gearbox filter gasket"] },
      { id: 6, nos_code: "ASC/N1403", title: "Spark Plug & Ignition Coil Testing", subtitle: "Checking plug gap, coil resistance, and cylinder misfire", video_id: "tXXgjbB7pmI", pcs: ["PC14. Measure spark plug gap", "PC15. Test ignition coil resistance"] },
      { id: 7, nos_code: "ASC/N1404", title: "Air & Cabin Filter Replacement", subtitle: "Cleaning intake housing and replacing cabin pollen filter", video_id: "NelPI2MHwbQ", pcs: ["PC16. Remove engine air filter box", "PC17. Install OEM cabin pollen filter"] },
      { id: 8, nos_code: "ASC/N1404", title: "Cooling System Pressure Test", subtitle: "Checking radiator pressure, hoses, and coolant flush", video_id: "Vk6d0lzAtaQ", pcs: ["PC18. Pressurize cooling system", "PC19. Flush radiator coolant"] },
      { id: 9, nos_code: "ASC/N1405", title: "Electrical Circuit & Fuse Troubleshooting", subtitle: "Using digital multimeter to check relay switches and fuses", video_id: "tXXgjbB7pmI", pcs: ["PC20. Test blown fuse continuity", "PC21. Measure relay voltage drop"] },
      { id: 10, nos_code: "ASC/N1405", title: "Tire Rotation & Wheel Balancing", subtitle: "Balancing weights and checking tire tread depth", video_id: "NelPI2MHwbQ", pcs: ["PC22. Mount wheel on balancer", "PC23. Apply lead balancing weights"] },
      { id: 11, nos_code: "ASC/N1405", title: "Final Road Test & Quality Inspection", subtitle: "Completing service job card and customer handover test", video_id: "Vk6d0lzAtaQ", pcs: ["PC24. Perform road test inspection", "PC25. Reset service reminder light"] }
    ]
  },
  {
    qp_code: "HSS/Q5101",
    version: "3.0",
    title: "General Duty Assistant (GDA)",
    subtitle: "Government Approved NSQF QP for patient care, vital signs monitoring, and hospital ward procedures",
    sector: "Healthcare",
    sub_sector: "Hospital Operations",
    nsqf_level: 3,
    credits: 14.0,
    lessons_count: 11,
    pdf_url: "https://admin.skillindiadigital.gov.in/pdf/HSS_Q5101_v3.0.pdf",
    lessons: [
      { id: 1, nos_code: "HSS/N5101", title: "Patient Vital Signs Measurement", subtitle: "Checking BP, pulse, temperature, and SpO2 saturation", video_id: "tXXgjbB7pmI", pcs: ["PC1. Wash hands using WHO 7-step method", "PC2. Prepare digital BP monitor", "PC3. Record readings in chart"] },
      { id: 2, nos_code: "HSS/N5101", title: "Patient Hygiene & Bed Bath Protocol", subtitle: "Assisting bedridden patients with daily hygiene and linen change", video_id: "NelPI2MHwbQ", pcs: ["PC4. Maintain patient dignity and privacy", "PC5. Prepare warm water basin", "PC6. Change bed linen safely"] },
      { id: 3, nos_code: "HSS/N5102", title: "Wheelchair & Stretcher Patient Transfer", subtitle: "Safe ergonomics for moving patients between bed and chair", video_id: "Vk6d0lzAtaQ", pcs: ["PC7. Lock wheelchair brakes", "PC8. Apply gait safety belt", "PC9. Transfer patient smoothly"] },
      { id: 4, nos_code: "HSS/N5102", title: "Infection Control & PPE Donning/Doffing", subtitle: "Proper sequence for gloves, mask, gown, and face shield", video_id: "tXXgjbB7pmI", pcs: ["PC10. Don gown and N95 mask", "PC11. Doff PPE in safe order"] },
      { id: 5, nos_code: "HSS/N5103", title: "Bio-Medical Waste Segregation", subtitle: "Color-coded bin disposal (Yellow, Red, Blue, Black)", video_id: "NelPI2MHwbQ", pcs: ["PC12. Dispose infectious waste in Yellow bin", "PC13. Dispose sharps in Blue container"] },
      { id: 6, nos_code: "HSS/N5103", title: "Patient Feeding & Nutrition Support", subtitle: "Assisting semi-fowler position feeding and fluid tracking", video_id: "Vk6d0lzAtaQ", pcs: ["PC14. Elevate bed head 45 degrees", "PC15. Record fluid intake/output"] },
      { id: 7, nos_code: "HSS/N5104", title: "Surgical Ward Preparation & Sterilization", subtitle: "Disinfecting ward equipment and autoclaved tray prep", video_id: "tXXgjbB7pmI", pcs: ["PC16. Wipe surfaces with disinfectant", "PC17. Inspect autoclave indicator tape"] },
      { id: 8, nos_code: "HSS/N5104", title: "Basic First Aid & Emergency CPR Support", subtitle: "Chest compressions and alert protocol for Code Blue", video_id: "NelPI2MHwbQ", pcs: ["PC18. Assess patient responsiveness", "PC19. Call Code Blue and initiate CPR"] },
      { id: 9, nos_code: "HSS/N5105", title: "Specimen Collection & Lab Transport", subtitle: "Labeling blood and urine vials and safe transport box", video_id: "Vk6d0lzAtaQ", pcs: ["PC20. Verify patient ID on sample tube", "PC21. Transport samples in sealed container"] },
      { id: 10, nos_code: "HSS/N5105", title: "Fall Prevention & Ward Safety", subtitle: "Bed rail safety, call button placement, and spill cleanup", video_id: "tXXgjbB7pmI", pcs: ["PC22. Elevate bed side rails", "PC23. Place call bell in patient reach"] },
      { id: 11, nos_code: "HSS/N5105", title: "Nursing Shift Handover & Charting", subtitle: "Accurate logging of patient notes for incoming shift", video_id: "NelPI2MHwbQ", pcs: ["PC24. Update vital sign flow sheet", "PC25. Verbal handover to staff nurse"] }
    ]
  },
  {
    qp_code: "SSC/Q0501",
    version: "2.0",
    title: "Web & Front-End Software Developer",
    subtitle: "Government Approved NSQF QP for responsive web interfaces, JS logic, and web APIs",
    sector: "IT-ITeS",
    sub_sector: "Software Products",
    nsqf_level: 5,
    credits: 24.0,
    lessons_count: 11,
    pdf_url: "https://admin.skillindiadigital.gov.in/pdf/SSC_Q0501_v2.0.pdf",
    lessons: [
      { id: 1, nos_code: "SSC/N0501", title: "DOM Manipulation & State Management", subtitle: "Creating dynamic UI components using modern JavaScript", video_id: "Vk6d0lzAtaQ", pcs: ["PC1. Structure HTML5 semantic tags", "PC2. Apply CSS Flexbox & Grid", "PC3. Implement async fetch API"] },
      { id: 2, nos_code: "SSC/N0501", title: "Responsive Web Layouts & CSS Media Queries", subtitle: "Building mobile-first adaptive web designs", video_id: "tXXgjbB7pmI", pcs: ["PC4. Design viewport breakpoints", "PC5. Optimize fluid typography and spacing"] },
      { id: 3, nos_code: "SSC/N0502", title: "JavaScript Async/Await & REST API Integration", subtitle: "Fetching JSON data and handling network errors", video_id: "NelPI2MHwbQ", pcs: ["PC6. Construct fetch requests with try-catch", "PC7. Parse JSON payloads into state"] },
      { id: 4, nos_code: "SSC/N0502", title: "Git Version Control & Branch Management", subtitle: "Git commits, pull requests, and resolving merge conflicts", video_id: "Vk6d0lzAtaQ", pcs: ["PC8. Initialize Git workspace", "PC9. Create feature branches and merge"] },
      { id: 5, nos_code: "SSC/N0503", title: "Web Accessibility (WCAG 2.1) & ARIA Attributes", subtitle: "Ensuring screen reader support and keyboard navigation", video_id: "tXXgjbB7pmI", pcs: ["PC10. Add aria-labels to interactive elements", "PC11. Verify contrast ratio > 4.5:1"] },
      { id: 6, nos_code: "SSC/N0503", title: "Web Performance Optimization & CWV", subtitle: "Minimizing LCP, INP, CLS, and lazy loading images", video_id: "NelPI2MHwbQ", pcs: ["PC12. Compress web assets", "PC13. Audit page speed via Lighthouse"] },
      { id: 7, nos_code: "SSC/N0504", title: "Client-Side Form Validation & Security", subtitle: "Sanitizing user inputs and preventing XSS attacks", video_id: "Vk6d0lzAtaQ", pcs: ["PC14. Validate regex email patterns", "PC15. Escape HTML input parameters"] },
      { id: 8, nos_code: "SSC/N0504", title: "Local State & IndexedDB Storage Caching", subtitle: "Persisting offline PWA app data in client storage", video_id: "tXXgjbB7pmI", pcs: ["PC16. Store user session in localStorage", "PC17. Implement IndexedDB offline cache"] },
      { id: 9, nos_code: "SSC/N0505", title: "Progressive Web App (PWA) Service Worker", subtitle: "Service worker registration and manifest file setup", video_id: "NelPI2MHwbQ", pcs: ["PC18. Register service worker lifecycle", "PC19. Configure manifest.json display"] },
      { id: 10, nos_code: "SSC/N0505", title: "Unit Testing & Component Debugging", subtitle: "Writing test suites and debugging via Chrome DevTools", video_id: "Vk6d0lzAtaQ", pcs: ["PC20. Set breakpoints in Chrome DevTools", "PC21. Run component assertions"] },
      { id: 11, nos_code: "SSC/N0505", title: "Production Deployment & Cloud Hosting", subtitle: "Deploying production build artifacts to Cloudflare Pages", video_id: "tXXgjbB7pmI", pcs: ["PC22. Build production assets", "PC23. Verify HTTPS SSL certificate"] }
    ]
  },
  {
    qp_code: "LSC/Q1101",
    version: "2.0",
    title: "Warehouse Inventory Clerk",
    subtitle: "Government Approved NSQF QP for barcode scanning, stock auditing, and inventory control",
    sector: "Logistics",
    sub_sector: "Warehousing",
    nsqf_level: 3,
    credits: 16.0,
    lessons_count: 11,
    pdf_url: "https://admin.skillindiadigital.gov.in/pdf/LSC_Q1101_v2.0.pdf",
    lessons: [
      { id: 1, nos_code: "LSC/N1101", title: "Inbound Stock Receiving & Barcode Verification", subtitle: "Scanning incoming shipment pallets and logging SKU IDs", video_id: "tXXgjbB7pmI", pcs: ["PC1. Scan RFID/barcode tags", "PC2. Match received stock with purchase order"] },
      { id: 2, nos_code: "LSC/N1101", title: "Pallet Racking & Bin Location Staging", subtitle: "Organizing inventory by shelf codes and velocity tiers", video_id: "NelPI2MHwbQ", pcs: ["PC3. Assign bin location in WMS", "PC4. Stack fast-moving items near dock"] },
      { id: 3, nos_code: "LSC/N1102", title: "Cycle Counting & Physical Stock Audit", subtitle: "Conducting perpetual inventory counts and variance tracking", video_id: "Vk6d0lzAtaQ", pcs: ["PC5. Perform daily cycle count", "PC6. Report inventory discrepancies"] },
      { id: 4, nos_code: "LSC/N1102", title: "Pick List Processing & Order Packing", subtitle: "Fulfilling customer orders with voice/scan picking tools", video_id: "tXXgjbB7pmI", pcs: ["PC7. Generate order pick list", "PC8. Pack items into corrugated boxes"] },
      { id: 5, nos_code: "LSC/N1103", title: "Hazardous Materials (HAZMAT) Storage", subtitle: "Segregating flammables and chemicals per MSDS guidelines", video_id: "NelPI2MHwbQ", pcs: ["PC9. Review MSDS safety sheets", "PC10. Store chemicals in vented cages"] },
      { id: 6, nos_code: "LSC/N1103", title: "Forklift & Hydraulic Pallet Truck Safety", subtitle: "Operating electric stackers and manual pallet jacks", video_id: "Vk6d0lzAtaQ", pcs: ["PC11. Inspect hydraulic fluid levels", "PC12. Maintain 5km/h aisle speed limit"] },
      { id: 7, nos_code: "LSC/N1104", title: "Outbound Dispatch & Shipping Manifests", subtitle: "Securing truck loads and printing bills of lading", video_id: "tXXgjbB7pmI", pcs: ["PC13. Print shipping labels", "PC14. Handover manifest to freight driver"] },
      { id: 8, nos_code: "LSC/N1104", title: "Damaged Goods & Return Merchandise (RMA)", subtitle: "Processing customer returns and quarantine inspection", video_id: "NelPI2MHwbQ", pcs: ["PC15. Log RMA reason in system", "PC16. Move damaged items to quarantine zone"] },
      { id: 9, nos_code: "LSC/N1105", title: "Warehouse ERP System Data Entry", subtitle: "Updating SAP/WMS inventory balances in real time", video_id: "Vk6d0lzAtaQ", pcs: ["PC17. Input stock adjustments", "PC18. Export daily inventory summary"] },
      { id: 10, nos_code: "LSC/N1105", title: "Cleanliness & 5S Workplace Organization", subtitle: "Applying Sort, Set in Order, Shine, Standardize, Sustain", video_id: "tXXgjbB7pmI", pcs: ["PC19. Sweep warehouse aisles", "PC20. Keep emergency exits clear"] },
      { id: 11, nos_code: "LSC/N1105", title: "End-of-Day Dock Lockout & Audit", subtitle: "Securing warehouse loading bays and locking dock doors", video_id: "NelPI2MHwbQ", pcs: ["PC21. Engage dock leveler locks", "PC22. Verify security alarm system"] }
    ]
  },
  {
    qp_code: "ELE/Q3101",
    version: "2.0",
    title: "Solar Panel & Rooftop PV Installer",
    subtitle: "Government Approved NSQF QP for solar module mounting, inverter wiring, and grid synchronization",
    sector: "Electronics",
    sub_sector: "Solar Electronics",
    nsqf_level: 4,
    credits: 20.0,
    lessons_count: 11,
    pdf_url: "https://admin.skillindiadigital.gov.in/pdf/ELE_Q3101_v2.0.pdf",
    lessons: [
      { id: 1, nos_code: "ELE/N3101", title: "Rooftop Solar Site Survey & Tilt Calculation", subtitle: "Measuring shadow-free roof area and optimal tilt angles", video_id: "Vk6d0lzAtaQ", pcs: ["PC1. Measure roof azimuth angle", "PC2. Calculate solar tilt angle for latitude"] },
      { id: 2, nos_code: "ELE/N3101", title: "Solar Mounting Structure & Anchor Installation", subtitle: "Fixing aluminum rails and weather-proofing roof anchors", video_id: "tXXgjbB7pmI", pcs: ["PC3. Drill roof anchor points", "PC4. Apply waterproof sealant around bolts"] },
      { id: 3, nos_code: "ELE/N3102", title: "Solar PV Module Mounting & Interconnection", subtitle: "Securing solar panels with mid-clamps and MC4 connectors", video_id: "NelPI2MHwbQ", pcs: ["PC5. Fasten PV module clamps", "PC6. Crimp MC4 solar connectors"] },
      { id: 4, nos_code: "ELE/N3102", title: "DC Combiner Box & Surge Protection (SPD)", subtitle: "Wiring DC fuses, isolator switches, and surge arrestors", video_id: "Vk6d0lzAtaQ", pcs: ["PC7. Wire DC surge protection device", "PC8. Install DC rotary isolator switch"] },
      { id: 5, nos_code: "ELE/N3103", title: "Solar String Inverter Mounting & Wiring", subtitle: "Connecting DC solar strings to inverter input terminals", video_id: "tXXgjbB7pmI", pcs: ["PC9. Mount inverter on shaded wall", "PC10. Connect DC cables to MPPT tracker"] },
      { id: 6, nos_code: "ELE/N3103", title: "AC Distribution Board & Net Metering Sync", subtitle: "Connecting AC output to bidirectional grid meter", video_id: "NelPI2MHwbQ", pcs: ["PC11. Connect AC circuit breaker", "PC12. Wire bidirectional net meter"] },
      { id: 7, nos_code: "ELE/N3104", title: "System Grounding & Lightning Arrestor Setup", subtitle: "Installing copper earth pits and grounding PV array frame", video_id: "Vk6d0lzAtaQ", pcs: ["PC13. Drive copper earth electrode", "PC14. Bond solar structure to ground pit"] },
      { id: 8, nos_code: "ELE/N3104", title: "Solar Battery Storage Bank Connection", subtitle: "Wiring Lithium-ion / Tubular battery storage units", video_id: "tXXgjbB7pmI", pcs: ["PC15. Connect battery BMS communications", "PC16. Set battery charge parameters"] },
      { id: 9, nos_code: "ELE/N3105", title: "PV System Commissioning & Voltage Testing", subtitle: "Measuring open circuit voltage (Voc) and short circuit current (Isc)", video_id: "NelPI2MHwbQ", pcs: ["PC17. Measure string Voc with multimeter", "PC18. Verify inverter grid sync LED"] },
      { id: 10, nos_code: "ELE/N3105", title: "Solar Monitoring App & Wi-Fi Gateway Setup", subtitle: "Pairing inverter Wi-Fi dongle to cloud portal", video_id: "Vk6d0lzAtaQ", pcs: ["PC19. Configure Wi-Fi monitoring dongle", "PC20. Verify live power graph on mobile app"] },
      { id: 11, nos_code: "ELE/N3105", title: "Customer Maintenance Handover & Safety Inspection", subtitle: "Educating customer on panel cleaning and safety isolation", video_id: "tXXgjbB7pmI", pcs: ["PC21. Explain emergency shutoff procedure", "PC22. Provide annual panel cleaning guide"] }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MOCK_QPS };
}

