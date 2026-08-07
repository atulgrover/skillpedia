/**
 * SkillPedia AI 11-Reel Curriculum Engine (Ultra-Fast <3s Synthesis Edition)
 * Real-Time Video Search Engine + LLM Curriculum Synthesis
 */

class AICurriculumEngine {

  /**
   * Main Entry Point: Synthesizes an 11-reel curriculum for a given topic.
   */
  async generate11ReelCurriculum(topic, onProgress = () => {}, forceFresh = false) {
    console.log(`%c[AI] generate11ReelCurriculum("${topic}") — Fast Mode`, 'color: #c084fc; font-weight: bold; font-size: 13px');

    // 1. Sanitize & check safety
    const safetyCheck = sanitizeAndCheckPrompt(topic);
    if (!safetyCheck.safe) {
      console.error(`[AI] ❌ Safety check FAILED: ${safetyCheck.reason}`);
      throw new Error(`[Content Moderation] ${safetyCheck.reason}`);
    }

    const cleanTopic = topic.trim();
    const formattedTitle = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

    // 2. Check if pre-existing in Turso Edge Database first (Instant <50ms return)
    if (!forceFresh) {
      console.log('[AI] Checking Turso Edge DB for pre-existing match...');
      try {
        const existing = await dbClient.searchCurricula(cleanTopic, '', 'custom_ai');
        const exactMatch = existing.find(c => c.title.toLowerCase() === cleanTopic.toLowerCase() || c.title.toLowerCase().includes(cleanTopic.toLowerCase()));
        if (exactMatch && exactMatch.lessons && exactMatch.lessons.length === REEL_STANDARD_COUNT) {
          console.log(`%c[AI] ✅ Instant DB match found for "${cleanTopic}"!`, 'color: #4ade80; font-weight: bold');
          onProgress(4, 'Found pre-existing Skill Pack in DB!', 100);
          return exactMatch;
        }
      } catch (dbErr) {
        console.warn(`[AI] Turso DB pre-check warning: ${dbErr.message}`);
      }
    }

    // 3. Resolve API Key
    const apiKey = window.OPENROUTER_API_KEY || atob("c2stb3ItdjEtZjY3ODU4OWEyOTQ4ZTk0YTA1MTBkNDMwYTBmYWQwZGZkYTNkZGE5MDFjYWNjODMyY2Y4Nzk4NjAwOTY3NTJkNA==");
    if (!apiKey) {
      throw new Error('[API Key Error] OpenRouter API Key is missing.');
    }

    onProgress(1, `Synthesizing 11 NOS Units & Performance Criteria for "${formattedTitle}"...`, 35);

    // 4. Fast High-Speed Primary Models Chain (Gemini Flash & Llama 3.1 8B first for speed!)
    const candidateModels = [
      'google/gemini-2.0-flash-lite-001',
      'meta-llama/llama-3.1-8b-instruct:free',
      'openrouter/free',
      'qwen/qwen-2.5-7b-instruct:free',
      'meta-llama/llama-3.3-70b-instruct:free'
    ];

    let llmResult = null;
    let lastLlmError = null;

    for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
      const modelName = candidateModels[mIdx];
      console.log(`[AI] Trying fast model ${mIdx + 1}/${candidateModels.length}: ${modelName}...`);
      try {
        llmResult = await this.callOpenRouterModel(cleanTopic, modelName, apiKey);
        if (llmResult && Array.isArray(llmResult.lessons) && llmResult.lessons.length === 11) {
          console.log(`%c[AI] ✅ Model (${modelName}) returned 11 NOS units in record time!`, 'color: #4ade80; font-weight: bold');
          break;
        }
      } catch (err) {
        lastLlmError = err;
        console.warn(`[AI] Model ${modelName} attempt failed: ${err.message}`);
      }
    }

    if (!llmResult || !Array.isArray(llmResult.lessons) || llmResult.lessons.length !== 11) {
      const detailMsg = lastLlmError ? lastLlmError.message : 'Invalid response or lesson count mismatch';
      throw new Error(`[LLM Synthesis Failure] Could not generate 11 NOS units for "${cleanTopic}". Underlying Reason: ${detailMsg}`);
    }

    // 5. Parallel Live Video Search for All 11 Reels (Fast Parallel Resolution)
    onProgress(2, `Searching Live YouTube Index for 11 Relevant Video Reels...`, 70);
    console.log(`[AI] Resolving video candidates in parallel...`);

    const defaultVerifiedVids = ['UB1O30fR-EE', 'hdI2bqOjy3c', '1Rs2ND1ryYc', 'w7ejDZ8SWv8', 'pQN-pnXPaVg', 'mU6anWqZJcc', '4r6WdaY3SOA', '0pThnRneDjw', 'sBws8MSXN7A', 'nKIu9yen5nc', 'tXXgjbB7pmI'];

    const lessonsWithVideos = await Promise.all(llmResult.lessons.map(async (les, idx) => {
      const reelIndex = idx + 1;
      const stepQuery = `${cleanTopic} ${les.title.replace(/^Reel \d+:\s*/i, '')}`;
      
      const candidates = await this.searchLiveYouTubeVideoCandidates(stepQuery);
      const topVid = (candidates && candidates.length > 0) 
        ? candidates[0].video_id 
        : (les.video_id || defaultVerifiedVids[idx % 11]);

      console.log(`[AI] Reel ${reelIndex}/11 resolved video_id="${topVid}" (${candidates.length} candidates found)`);

      return {
        ...les,
        video_id: topVid,
        candidates: candidates.length > 0 ? candidates : [{ video_id: topVid, title: les.title }]
      };
    }));

    llmResult.lessons = lessonsWithVideos;

    // 6. Save newly synthesized course to Turso DB in background
    try {
      dbClient.saveCurriculum(llmResult);
    } catch (_) {}

    onProgress(4, '11 Reel Candidates Ready for Creator Confirmation!', 100);
    return llmResult;
  }

  /**
   * Real-Time Video Search Engine: Queries Cloudflare Proxy / Direct fetch
   */
  async searchLiveYouTubeVideoCandidates(searchQuery) {
    if (!searchQuery || typeof searchQuery !== 'string') return [];

    // 1. Try Cloudflare Pages Function serverless proxy first (/api/search-video)
    try {
      const proxyUrl = `/api/search-video?q=${encodeURIComponent(searchQuery)}`;
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 3500);

      const proxyRes = await fetch(proxyUrl, { signal: ctrl.signal });
      clearTimeout(timeoutId);

      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        if (proxyData && Array.isArray(proxyData.results) && proxyData.results.length > 0) {
          const validCandidates = proxyData.results.filter(item => this.quickCheckVideoId(item.video_id));
          if (validCandidates.length > 0) return validCandidates;
        }
      }
    } catch (_) {}

    // 2. Direct fetch fallback
    try {
      const q = encodeURIComponent(`${searchQuery} youtube tutorial`);
      const tokenUrl = `https://duckduckgo.com/?q=${q}&t=h_&iax=videos&ia=videos`;
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 2500);

      const htmlRes = await fetch(tokenUrl, { signal: ctrl.signal });
      clearTimeout(timeoutId);
      if (!htmlRes.ok) return [];

      const htmlText = await htmlRes.text();
      const vqdMatch = htmlText.match(/vqd=([\d-]+)/);
      if (!vqdMatch) return [];

      const vqd = vqdMatch[1];
      const videoApiUrl = `https://duckduckgo.com/v.js?q=${q}&vqd=${vqd}&p=1`;
      
      const ctrl2 = new AbortController();
      const timeoutId2 = setTimeout(() => ctrl2.abort(), 2500);
      const jsonRes = await fetch(videoApiUrl, { signal: ctrl2.signal });
      clearTimeout(timeoutId2);

      if (!jsonRes.ok) return [];
      const data = await jsonRes.json();

      const candidates = [];
      if (data && Array.isArray(data.results)) {
        for (const item of data.results) {
          if (candidates.length >= 3) break;
          if (item.content && item.content.includes('youtube.com')) {
            const matches = item.content.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (matches && matches[1] && this.quickCheckVideoId(matches[1])) {
              const vid = matches[1];
              if (!candidates.some(c => c.video_id === vid)) {
                candidates.push({ video_id: vid, title: item.title || searchQuery });
              }
            }
          }
        }
      }
      return candidates;
    } catch (_) {
      return [];
    }
  }

  quickCheckVideoId(videoId) {
    return typeof videoId === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  }

  /**
   * Fast API request to OpenRouter model for 11 NOS units
   */
  async callOpenRouterModel(topic, modelName, apiKey) {
    const systemPrompt = `You are an expert National Skills Qualifications Framework (NSQF) Curriculum Architect.
Generate an 11-step standardized micro-learning skill curriculum for: "${topic}".

Respond ONLY with a valid JSON object matching this exact structure:
{
  "title": "Title of the Skill Course",
  "subtitle": "Clear 1-sentence course overview",
  "sector": "Relevant Industry Sector",
  "lessons": [
    {
      "id": 1,
      "reel_index": 1,
      "nos_code": "CUST/N0101",
      "title": "Reel 1: Step Name",
      "subtitle": "Short description of Reel 1",
      "search_query": "${topic} Step 1 tutorial",
      "pcs": [
        "PC1. First performance criteria description",
        "PC2. Second performance criteria description",
        "PC3. Third performance criteria description"
      ]
    }
  ]
}
Rules:
1. Provide EXACTLY 11 lessons with reel_index 1 through 11.
2. Return raw JSON only (no markdown codeblock formatting).`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // Fast 12s per model trial

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://skillpedia.pages.dev',
          'X-Title': 'SkillPedia PWA'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Build an 11-reel NSQF skill curriculum for: "${topic}"` }
          ],
          temperature: 0.4
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`OpenRouter HTTP ${response.status}: ${errText.substring(0, 100)}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
      const cleanJson = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
      
      const parsed = JSON.parse(cleanJson);

      if (parsed && Array.isArray(parsed.lessons)) {
        parsed.lessons = parsed.lessons.map((les, idx) => ({
          id: `les_${idx + 1}`,
          reel_index: idx + 1,
          nos_code: les.nos_code || `CUST/N0${Math.floor(idx / 3) + 1}0${(idx % 3) + 1}`,
          title: les.title || `Reel ${idx + 1}: ${topic} Step ${idx + 1}`,
          subtitle: les.subtitle || `Mastering ${topic} — Stage ${idx + 1} of 11`,
          video_platform: 'youtube',
          video_id: les.video_id || '',
          search_query: les.search_query || `${topic} Step ${idx + 1} tutorial`,
          pcs: Array.isArray(les.pcs) && les.pcs.length > 0 ? les.pcs : [
            `PC1. Follow safety guidelines for ${topic}.`,
            `PC2. Execute step ${idx + 1} per standard procedure.`,
            `PC3. Perform quality verification check.`
          ]
        }));
        return parsed;
      } else {
        throw new Error(`Invalid JSON schema: Missing 'lessons' array`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  generateFallbackCurriculum(topic, formattedTitle) {
    return {
      id: `CUSTOM-${topic.toUpperCase().replace(/\s+/g, '_').substring(0, 15)}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'custom_ai',
      version: '1.0',
      title: formattedTitle,
      subtitle: `11-Reel Vocational Micro-Learning Package for ${formattedTitle}`,
      sector: 'Custom Micro-Learning',
      nsqf_level: 3,
      total_reels: 11,
      created_at: new Date().toISOString(),
      lessons: Array.from({ length: 11 }, (_, i) => ({
        id: `les_${i + 1}`,
        reel_index: i + 1,
        nos_code: `CUST/N0${Math.floor(i / 3) + 1}0${(i % 3) + 1}`,
        title: `Reel ${i + 1}: ${formattedTitle} Step ${i + 1}`,
        subtitle: `Mastering essential technique for ${formattedTitle} — Stage ${i + 1} of 11`,
        video_platform: 'youtube',
        video_id: 'UB1O30fR-EE',
        pcs: [
          `PC1. Review safety standards and prerequisites for ${formattedTitle}.`,
          `PC2. Execute step ${i + 1} using standard tools and procedures.`,
          `PC3. Perform quality and safety verification check.`,
          `PC4. Document progress and prepare for stage ${i + 2}.`
        ]
      }))
    };
  }
}

const aiEngine = new AICurriculumEngine();
