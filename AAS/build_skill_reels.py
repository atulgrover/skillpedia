#!/usr/bin/env python3
import os

LESSONS = [
    {
        "id": 1,
        "nos_code": "AAS/N0101",
        "title": "Aircraft Arrival & Cargo Receiving",
        "subtitle": "Receiving incoming air cargo at aircraft ramp & warehouse transport",
        "video_id": "tXXgjbB7pmI",
        "pcs": [
            "PC1. Gather information on incoming cargo volume & type; notify authorities.",
            "PC2. Deploy adequate equipment (dollies, forklifts) for incoming volume.",
            "PC3. Receive incoming cargo and air waybill documents at aircraft ramp.",
            "PC4. Transport incoming cargo safely using equipment to warehouse.",
            "PC5. Stage cargo at designated warehouse staging bays.",
            "PC6. Handover cargo and documents to warehouse receiving team."
        ]
    },
    {
        "id": 2,
        "nos_code": "AAS/N0101",
        "title": "Cargo Breakdown & Air Waybill Inspection",
        "subtitle": "Segregation of consignments and visual damage verification",
        "video_id": "NelPI2MHwbQ",
        "pcs": [
            "PC7. Breakdown cargo from built-up configuration & segregate by Air Waybill (AWB).",
            "PC8. Verify AWB numbers and consignment counts against cargo manifests.",
            "PC9. Visually inspect cargo for damage/discrepancies and log records.",
            "PC10. Oversee storage and stacking as per regulatory procedures and record location."
        ]
    },
    {
        "id": 3,
        "nos_code": "AAS/N0101",
        "title": "Delivery Order & Recipient Cargo Release",
        "subtitle": "System updates, DO issuance, and recipient handover",
        "video_id": "Vk6d0lzAtaQ",
        "pcs": [
            "PC11. Update cargo management system with complete incoming cargo details.",
            "PC12. Notify recipient/shipper of shipment arrival via official channels.",
            "PC13. Create Delivery Order (DO) according to org policies and regulatory rules.",
            "PC14. Verify proof of DO payment / charges from recipient representative.",
            "PC15. Retrieve cargo from storage and deliver to verified recipient.",
            "PC16. Update system with delivery confirmation and archive records."
        ]
    },
    {
        "id": 4,
        "nos_code": "AAS/N0102",
        "title": "Export Cargo Acceptance & Booking Verification",
        "subtitle": "Accepting outward shipment & document verification",
        "video_id": "8BjCgsnawgk",
        "pcs": [
            "PC1. Receive cargo/mail documents from shipper & verify AWB & booking status.",
            "PC2. Verify required export permits, customs docs & regulatory paperwork.",
            "PC3. Perform visual inspection of outward cargo for outer packaging damage."
        ]
    },
    {
        "id": 5,
        "nos_code": "AAS/N0102",
        "title": "Weighing, Staging & Security Screening",
        "subtitle": "Volumetric weight checks & security processing",
        "video_id": "nHrpKAuX8z0",
        "pcs": [
            "PC4. Perform weight and dimension check against AWB booking data.",
            "PC5. Process cargo/mail for X-ray / security check as per regulatory guidelines.",
            "PC6. Oversee stacking and record exact storage bay coordinates for retrieval."
        ]
    },
    {
        "id": 6,
        "nos_code": "AAS/N0102",
        "title": "ULD Buildup & Load Distribution",
        "subtitle": "Building pallets & Unit Load Devices according to load sheets",
        "video_id": "s--v76y_12c",
        "pcs": [
            "PC7. Oversee retrieval of stored cargo for flight buildup.",
            "PC8. Check ULD containers/pallets for structural damage before loading.",
            "PC9. Oversee buildup & load distribution as instructed by Load Controller.",
            "PC10. Verify built-up AWB details against flight manifest loading list."
        ]
    },
    {
        "id": 7,
        "nos_code": "AAS/N0102",
        "title": "Flight Dispatch & Aircraft Loading Handover",
        "subtitle": "Final manifest verification & ramp dispatch",
        "video_id": "-JRJ_7ZsKyU",
        "pcs": [
            "PC11. Verify all final ULD build-up documents match regulatory requirements.",
            "PC12. Dispatch built-up cargo & ULDs to aircraft loading ramp area.",
            "PC13. Update cargo management system with final flight load manifest."
        ]
    },
    {
        "id": 8,
        "nos_code": "AAS/N0502",
        "title": "Airport Workplace Safety & Compliance",
        "subtitle": "Personal protective equipment & regulatory safety guidelines",
        "video_id": "o-0H9kyTK9I",
        "pcs": [
            "PC1. Comply with organizational safety and security policies at all times.",
            "PC2. Follow regulatory guidelines to thwart unlawful interference acts.",
            "PC3. Report safety breaches immediately to designated supervisors.",
            "PC4. Coordinate with airport teams for a safe working environment.",
            "PC5. Mitigate immediate safety hazards (spills, trips) within personal authority."
        ]
    },
    {
        "id": 9,
        "nos_code": "AAS/N0502",
        "title": "Hazard Mitigation & Emergency Response",
        "subtitle": "Fire safety, injury response & hazard escalation",
        "video_id": "NCIMjr-YN98",
        "pcs": [
            "PC6. Report hazards beyond personal authority to relevant managers.",
            "PC7. Follow emergency procedures for accidents, fires, and security alerts.",
            "PC8. Recommend health, safety, and operational improvements.",
            "PC9. Ensure health and safety logs are accurately completed and updated."
        ]
    },
    {
        "id": 10,
        "nos_code": "DGT/VSQ/N0102",
        "title": "21st Century Professionalism & Communication",
        "subtitle": "Workplace ethics, English skills, & teamwork",
        "video_id": "Az0RgcY8HT8",
        "pcs": [
            "PC3. Demonstrate civic rights, personal ethics, honesty & integrity.",
            "PC6. Practice self-awareness, time management & problem-solving.",
            "PC7. Use basic English for everyday conversations & phone calls.",
            "PC9. Write short clear messages, notes, and work emails in English.",
            "PC13. Work collaboratively with peers in aviation team settings."
        ]
    },
    {
        "id": 11,
        "nos_code": "DGT/VSQ/N0102",
        "title": "Digital, Financial & Legal Literacy",
        "subtitle": "Digital tools, salary components & POSH compliance",
        "video_id": "3uLLivFGlfE",
        "pcs": [
            "PC14. Behave respectfully with all genders and Persons with Disabilities (PwD).",
            "PC15. Escalate workplace harassment issues under POSH Act guidelines.",
            "PC17. Carry out digital transactions safely and securely.",
            "PC20. Operate digital devices & office productivity tools securely.",
            "PC22. Use spreadsheets & word processors for cargo inventory logging."
        ]
    },
    {
        "id": 12,
        "nos_code": "DGT/VSQ/N0102",
        "title": "Customer Service & Career Growth",
        "subtitle": "Professional grooming, customer care & job readiness",
        "video_id": "a99gQn9pkOM",
        "pcs": [
            "PC27. Respond to customer requests & airline queries professionally.",
            "PC28. Maintain high standards of personal hygiene and uniform grooming.",
            "PC29. Create a professional resume highlighting cargo skill competencies.",
            "PC32. Perform confidently during job interviews & selection tests."
        ]
    },
    {
        "id": 13,
        "nos_code": "AAS/N0702",
        "title": "Airside Vehicle Pre-Drive Inspection",
        "subtitle": "Vehicle lighting, permit check & pre-op inspection",
        "video_id": "mbgHFYI2pi8",
        "pcs": [
            "PC1. Verify Airside Driving Permit (ADP) is valid for specific vehicle class.",
            "PC2. Confirm vehicle lighting, amber beacon & obstruction markings are active.",
            "PC3. Complete vehicle inspection checklist before driving airside."
        ]
    },
    {
        "id": 14,
        "nos_code": "AAS/N0702",
        "title": "Airside Driving Rules & Aircraft Priority",
        "subtitle": "Navigating apron roadways, markings & aircraft right-of-way",
        "video_id": "79T-A_hnSzQ",
        "pcs": [
            "PC4. Manoeuvre vehicle safely under all weather and tarmac conditions.",
            "PC6. Follow airside signage, red stop lines & perimeter road markings.",
            "PC7. Give right-of-way priority to moving aircraft AT ALL TIMES.",
            "PC8. Maintain mandatory safe distance (at least 7.5m / 15m) from aircraft.",
            "PC10. Reverse vehicle strictly using trained guide/marshaller instructions."
        ]
    },
    {
        "id": 15,
        "nos_code": "AAS/N0702",
        "title": "FOD Prevention & Emergency Protocols",
        "subtitle": "Foreign Object Debris clearance & airside emergency response",
        "video_id": "wPM6dIPz3P4",
        "pcs": [
            "PC11. Maintain 360° constant vigilance while driving airside.",
            "PC12. Wear mandatory PPE (High-vis vest, ear defenders) inside vehicle/apron.",
            "PC15. Stop and collect Foreign Object Debris (FOD) or report tarmac spills.",
            "PC18. Provide immediate unhindered access to airport emergency vehicles.",
            "PC19. Report all airside vehicle incidents/scratches immediately."
        ]
    }
]

def generate_clean_html():
    logo_dark_b64 = ""
    logo_light_b64 = ""
    
    if os.path.exists('logo_dark_base64.txt'):
        with open('logo_dark_base64.txt', 'r') as f:
            logo_dark_b64 = f.read().strip()
    elif os.path.exists('logo_base64.txt'):
        with open('logo_base64.txt', 'r') as f:
            logo_dark_b64 = f.read().strip()

    if os.path.exists('logo_light_base64.txt'):
        with open('logo_light_base64.txt', 'r') as f:
            logo_light_b64 = f.read().strip()
    else:
        logo_light_b64 = logo_dark_b64

    cards_html = []

    # 1. STARTING COVER CARD (Card 1)
    cover_card = f"""
        <section class="card cover-card">
            <button id="themeToggle" class="theme-toggle-btn" aria-label="Toggle Theme">🌙</button>
            <div class="meta-badge-top">QP CODE: AAS/Q0103 • VERSION 3.0</div>

            <div class="image-center-box">
                <img src="{logo_dark_b64 if logo_dark_b64 else 'logo_dark.png'}" alt="Hayagriva - Skilled Craftsman" class="center-img logo-dark">
                <img src="{logo_light_b64 if logo_light_b64 else 'logo_light.png'}" alt="Hayagriva - Skilled Craftsman" class="center-img logo-light">
            </div>

            <div class="cover-metadata">
                <h1 class="skill-title">Airline Cargo Assistant</h1>
                <p class="council-name">Aerospace & Aviation Sector Skill Council</p>
                
                <div class="meta-tags">
                    <span class="tag-item">NSQF Level 3</span>
                    <span class="tag-item">Credits: 15.5</span>
                    <span class="tag-item">🎬 15 Lessons</span>
                </div>
            </div>

            <div class="swipe-hint">
                <span>SWIPE UP TO START LEARNING</span>
                <div class="arrow">↓</div>
            </div>
        </section>
    """
    cards_html.append(cover_card)

    # 2. LESSON CARDS WITH EMBEDDED IFRAME + PLAYINLINE (Cards 2 to 16)
    for index, lesson in enumerate(LESSONS, start=1):
        pcs_items = "".join([f"<li>{pc}</li>" for pc in lesson["pcs"]])
        # playsinline=1 allows video to play directly inside the card on iOS/Android without forcing full screen
        iframe_embed_url = f"https://www.youtube.com/embed/{lesson['video_id']}?playsinline=1&rel=0&modestbranding=1"
        yt_app_url = f"https://www.youtube.com/watch?v={lesson['video_id']}"

        card = f"""
        <section class="card video-card">
            <div class="card-header">
                <span class="tag">{lesson['nos_code']}</span>
                <span class="counter">Lesson {index} of {len(LESSONS)}</span>
            </div>

            <div class="video-container">
                <iframe src="{iframe_embed_url}" title="{lesson['title']}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>

            <div class="card-info">
                <div class="title-row">
                    <h2 class="lesson-title">{lesson['title']}</h2>
                    <a href="{yt_app_url}" target="_blank" class="yt-link-icon" title="Open in YouTube App">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    </a>
                </div>
                <p class="lesson-subtitle">{lesson['subtitle']}</p>

                <details class="pc-accordion">
                    <summary>📋 Performance Criteria ({len(lesson['pcs'])} Tasks)</summary>
                    <ul>
                        {pcs_items}
                    </ul>
                </details>
            </div>
        </section>
        """
        cards_html.append(card)

    full_cards_str = "\n".join(cards_html)

    html_content = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skill-Reels: Airline Cargo Assistant (AAS/Q0103)</title>
    <style>
        :root {{
            --bg-color: #07090e;
            --text-color: #f8fafc;
            --text-secondary: #94a3b8;
            --cover-bg: radial-gradient(circle at 50% 35%, #1e293b 0%, #0f172a 60%, #07090e 100%);
            --img-box-bg: rgba(15, 23, 42, 0.7);
            --img-box-border: rgba(255, 255, 255, 0.15);
            --img-box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 35px rgba(56, 189, 248, 0.25);
            --tag-bg: rgba(15, 23, 42, 0.85);
            --tag-border: rgba(255, 255, 255, 0.15);
            --badge-bg: rgba(56, 189, 248, 0.15);
            --badge-border: rgba(56, 189, 248, 0.4);
            --badge-color: #38bdf8;
            --accordion-bg: rgba(15, 23, 42, 0.8);
            --accordion-border: rgba(255, 255, 255, 0.12);
            --accordion-text: #e2e8f0;
        }}

        [data-theme="light"] {{
            --bg-color: #f8fafc;
            --text-color: #0f172a;
            --text-secondary: #475569;
            --cover-bg: radial-gradient(circle at 50% 35%, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%);
            --img-box-bg: rgba(255, 255, 255, 0.85);
            --img-box-border: rgba(15, 23, 42, 0.12);
            --img-box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08), 0 0 30px rgba(14, 165, 233, 0.15);
            --tag-bg: rgba(241, 245, 249, 0.9);
            --tag-border: rgba(15, 23, 42, 0.12);
            --badge-bg: rgba(14, 165, 233, 0.12);
            --badge-border: rgba(14, 165, 233, 0.35);
            --badge-color: #0284c7;
            --accordion-bg: rgba(241, 245, 249, 0.95);
            --accordion-border: rgba(15, 23, 42, 0.12);
            --accordion-text: #1e293b;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }}

        html, body {{
            width: 100%;
            height: 100%;
            background-color: var(--bg-color);
            color: var(--text-color);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            overflow: hidden;
            transition: background-color 0.3s ease, color 0.3s ease;
        }}

        .reels-container {{
            width: 100%;
            height: 100vh;
            height: 100dvh;
            overflow-y: scroll;
            scroll-snap-type: y mandatory;
            -webkit-overflow-scrolling: touch;
        }}

        .card {{
            width: 100%;
            height: 100vh;
            height: 100dvh;
            scroll-snap-align: start;
            scroll-snap-stop: always;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 20px 16px;
            background: var(--bg-color);
            box-sizing: border-box;
            transition: background-color 0.3s ease;
        }}

        .theme-toggle-btn {{
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 100;
            background: var(--tag-bg);
            border: 1px solid var(--tag-border);
            color: var(--text-color);
            border-radius: 50%;
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
        }}

        .theme-toggle-btn:hover {{
            transform: scale(1.1);
        }}

        /* COVER CARD (Card 1) */
        .cover-card {{
            background: var(--cover-bg);
            align-items: center;
            text-align: center;
            padding: 30px 20px 24px;
        }}

        .meta-badge-top {{
            background: var(--badge-bg);
            border: 1px solid var(--badge-border);
            color: var(--badge-color);
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }}

        .image-center-box {{
            background: var(--img-box-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 16px;
            border-radius: 28px;
            width: min(350px, 88vw);
            max-height: 46vh;
            aspect-ratio: 748 / 932;
            box-shadow: var(--img-box-shadow);
            border: 1px solid var(--img-box-border);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 12px auto;
            flex-shrink: 1;
            transition: all 0.3s ease;
        }}

        .center-img {{
            width: 100%;
            height: 100%;
            object-fit: contain;
        }}

        .logo-dark {{
            display: block;
        }}

        .logo-light {{
            display: none;
        }}

        [data-theme="light"] .logo-dark {{
            display: none;
        }}

        [data-theme="light"] .logo-light {{
            display: block;
        }}

        .cover-metadata {{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }}

        .skill-title {{
            font-size: 24px;
            font-weight: 900;
            color: var(--text-color);
            line-height: 1.2;
            letter-spacing: -0.3px;
        }}

        .council-name {{
            font-size: 13px;
            color: var(--text-secondary);
            max-width: 300px;
            line-height: 1.4;
        }}

        .meta-tags {{
            display: flex;
            gap: 8px;
            margin-top: 6px;
            flex-wrap: wrap;
            justify-content: center;
        }}

        .tag-item {{
            background: var(--tag-bg);
            border: 1px solid var(--tag-border);
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            color: var(--text-color);
        }}

        .swipe-hint {{
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: var(--badge-color);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            animation: bounce 2s infinite;
        }}

        .arrow {{
            font-size: 18px;
        }}

        @keyframes bounce {{
            0%, 20%, 50%, 80%, 100% {{ transform: translateY(0); }}
            40% {{ transform: translateY(-8px); }}
            60% {{ transform: translateY(-4px); }}
        }}

        /* VIDEO LESSON CARDS */
        .card-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            z-index: 10;
        }}

        .tag {{
            background: var(--badge-bg);
            border: 1px solid var(--badge-border);
            color: var(--badge-color);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
        }}

        .counter {{
            font-size: 12px;
            color: var(--text-secondary);
            font-weight: 600;
        }}

        .video-container {{
            width: 100%;
            flex-grow: 1;
            max-height: 55vh;
            margin: 10px 0;
            border-radius: 16px;
            overflow: hidden;
            background: #000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            position: relative;
        }}

        .video-container iframe {{
            width: 100%;
            height: 100%;
            border: none;
        }}

        .card-info {{
            display: flex;
            flex-direction: column;
            gap: 6px;
            z-index: 10;
        }}

        .title-row {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }}

        .lesson-title {{
            font-size: 16px;
            font-weight: 800;
            color: var(--text-color);
            line-height: 1.3;
        }}

        .yt-link-icon {{
            color: #f43f5e;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            border-radius: 6px;
            background: rgba(244, 63, 94, 0.1);
            text-decoration: none;
            flex-shrink: 0;
        }}

        .lesson-subtitle {{
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.4;
        }}

        .pc-accordion {{
            background: var(--accordion-bg);
            border: 1px solid var(--accordion-border);
            border-radius: 12px;
            padding: 10px 14px;
            margin-top: 6px;
        }}

        .pc-accordion summary {{
            font-size: 13px;
            font-weight: 700;
            color: var(--badge-color);
            cursor: pointer;
            outline: none;
        }}

        .pc-accordion ul {{
            margin-top: 8px;
            padding-left: 18px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }}

        .pc-accordion li {{
            font-size: 12px;
            color: var(--accordion-text);
            line-height: 1.4;
        }}
    </style>
</head>
<body>
    <div class="reels-container">
{full_cards_str}
    </div>
    <script>
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {{
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            toggleBtn.textContent = savedTheme === 'light' ? '☀️' : '🌙';

            toggleBtn.addEventListener('click', () => {{
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                toggleBtn.textContent = next === 'light' ? '☀️' : '🌙';
            }});
        }}
    </script>
</body>
</html>
"""
    return html_content

if __name__ == '__main__':
    html = generate_clean_html()
    output_path = os.path.join('/Users/atulgrover/Desktop/skillpedia/AAS', 'index.html')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Successfully generated static HTML with embedded YouTube iframe cards: {output_path} ({len(html)} bytes)")
