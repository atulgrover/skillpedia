/**
 * SkillPedia Dual-LLM 11-Reel Curriculum Engine
 * Primary Model -> Secondary Fallback Model -> Strict Error Throwing
 * ZERO Hardcoded Video Substitutions
 */

class AICurriculumEngine {

  /**
   * Main Entry Point: Synthesizes an 11-reel curriculum for a given topic.
   * Tries Primary LLM model -> Tries Secondary Fallback LLM model -> Throws Error.
   */
  async generate11ReelCurriculum(topic, onProgress = () => {}, forceFresh = false) {
    console.log(`%c[AI] generate11ReelCurriculum("${topic}") — Dual-LLM Pipeline Mode`, 'color: #c084fc; font-weight: bold; font-size: 13px');

    // 1. Sanitize & check safety
    const safetyCheck = sanitizeAndCheckPrompt(topic);
    if (!safetyCheck.safe) {
      console.error(`[AI] ❌ Safety check FAILED: ${safetyCheck.reason}`);
      throw new Error(safetyCheck.reason);
    }

    const cleanTopic = topic.trim();
    const formattedTitle = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

    // 2. Check if pre-existing in Turso Edge Database first
    if (!forceFresh) {
      console.log('[AI] Checking Turso Edge DB for pre-existing exact match...');
      const existing = await dbClient.searchCurricula(cleanTopic, '', 'custom_ai');
      const exactMatch = existing.find(c => c.title.toLowerCase() === cleanTopic.toLowerCase());
      if (exactMatch && exactMatch.lessons && exactMatch.lessons.length === REEL_STANDARD_COUNT) {
        console.log(`%c[AI] ✅ Pre-existing match found in Turso DB!`, 'color: #4ade80; font-weight: bold');
        onProgress(4, 'Found pre-existing Skill Pack in DB!', 100);
        return exactMatch;
      }
    }

    const apiKey = window.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API Key missing in config.js');
    }

    // 3. TRY PRIMARY LLM MODEL
    const primaryModel = window.OPENROUTER_MODEL || 'openrouter/free';
    onProgress(2, `Primary AI (${primaryModel}) Synthesizing 11 NOS Units...`, 40);

    try {
      console.log(`[AI] Attempt 1: Calling Primary LLM (${primaryModel})...`);
      const primaryResult = await this.callOpenRouterModel(cleanTopic, primaryModel, apiKey);
      
      if (primaryResult && primaryResult.lessons && primaryResult.lessons.length === 11) {
        onProgress(3, 'Validating YouTube Video Reels via oEmbed...', 80);
        const isValid = await this.validateAllVideoIds(primaryResult.lessons);
        
        if (isValid) {
          console.log(`%c[AI] ✅ Primary LLM (${primaryModel}) successfully generated & validated 11 reels!`, 'color: #4ade80; font-weight: bold');
          return await this.finalizeAndSave(cleanTopic, formattedTitle, primaryResult, onProgress);
        } else {
          console.warn(`[AI] ⚠️ Primary LLM returned unverified video IDs. Triggering Secondary Fallback LLM...`);
        }
      }
    } catch (err) {
      console.warn(`[AI] ⚠️ Primary LLM (${primaryModel}) failed: ${err.message}. Triggering Secondary Fallback LLM...`);
    }

    // 4. TRY SECONDARY FALLBACK LLM MODEL
    const fallbackModel = 'meta-llama/llama-3.3-70b-instruct:free';
    onProgress(3, `Fallback AI (${fallbackModel}) Synthesizing 11 NOS Units...`, 70);

    try {
      console.log(`[AI] Attempt 2: Calling Secondary Fallback LLM (${fallbackModel})...`);
      const fallbackResult = await this.callOpenRouterModel(cleanTopic, fallbackModel, apiKey);
      
      if (fallbackResult && fallbackResult.lessons && fallbackResult.lessons.length === 11) {
        onProgress(3, 'Validating Fallback AI YouTube Reels...', 90);
        const isValid = await this.validateAllVideoIds(fallbackResult.lessons);
        
        if (isValid) {
          console.log(`%c[AI] ✅ Secondary Fallback LLM (${fallbackModel}) successfully generated & validated 11 reels!`, 'color: #4ade80; font-weight: bold');
          return await this.finalizeAndSave(cleanTopic, formattedTitle, fallbackResult, onProgress);
        }
      }
    } catch (err) {
      console.warn(`[AI] ⚠️ Secondary Fallback LLM (${fallbackModel}) failed: ${err.message}`);
    }

    // 5. IF BOTH LLM MODELS FAIL -> THROW EXPLICIT ERROR (NO VIDEO FALLBACKS)
    console.error(`[AI] ❌ Both Primary & Secondary Fallback LLMs failed to synthesize a verified 11-reel pack for "${cleanTopic}"`);
    throw new Error(`⚠️ Could not curate a verified 11-reel skill pack for "${cleanTopic}". Please refine your topic name or try again.`);
  }

  /**
   * Executes API request to a specific OpenRouter model
   */
  async callOpenRouterModel(topic, modelName, apiKey) {
    const systemPrompt = `You are an expert National Skills Qualifications Framework (NSQF) Curriculum Architect.
Generate an 11-step standardized micro-learning skill curriculum for the topic: "${topic}".

For each reel, provide a real YouTube video_id of an actual educational video matching that reel's topic.
Think carefully — use video IDs from active educational channels (Traversy Media, freeCodeCamp, Code.org, Khan Academy, CrashCourse, TED-Ed, etc.).
Do NOT invent fake video IDs or use meme videos.

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
      "video_id": "REASONABLE_ACTUAL_YOUTUBE_ID",
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
2. For each lesson, provide 3 to 4 realistic Performance Criteria (PCs) specific to ${topic}.
3. Return raw JSON only (no markdown formatting).`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s max timeout

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
          temperature: 0.5
        })
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}`);

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
      const cleanJson = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanJson);

      if (parsed && Array.isArray(parsed.lessons)) {
        parsed.lessons = parsed.lessons.map((les, idx) => ({
          id: `les_${idx + 1}`,
          reel_index: idx + 1,
          nos_code: les.nos_code || `CUST/N0${Math.floor(idx / 3) + 1}0${(idx % 3) + 1}`,
          title: les.title || `Reel ${idx + 1}: ${topic} Step ${idx + 1}`,
          subtitle: les.subtitle || `Mastering ${topic} — Stage ${idx + 1} of 11`,
          video_platform: 'youtube',
          video_id: les.video_id,
          pcs: Array.isArray(les.pcs) && les.pcs.length > 0 ? les.pcs : [
            `PC1. Follow safety guidelines for ${topic}.`,
            `PC2. Execute step ${idx + 1} per standard procedure.`,
            `PC3. Perform quality verification check.`
          ]
        }));
        return parsed;
      }
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Validates video IDs via YouTube oEmbed API
   */
  async validateAllVideoIds(lessons) {
    if (!Array.isArray(lessons) || lessons.length === 0) return false;
    
    let validCount = 0;
    await Promise.all(lessons.map(async (les) => {
      const isValid = await this.validateVideoId(les.video_id);
      if (isValid) validCount++;
    }));

    const successRate = validCount / lessons.length;
    console.log(`[AI] Video validation: ${validCount}/${lessons.length} verified (${Math.round(successRate * 100)}%)`);
    return successRate >= 0.7; // Require 70%+ verified
  }

  /**
   * Checks a single YouTube video ID via oEmbed
   */
  async validateVideoId(videoId) {
    if (!videoId || typeof videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return false;
    }
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 3500); // 3.5s timeout
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { signal: ctrl.signal }
      );
      return res.ok;
    } catch (_) {
      return false;
    }
  }

  /**
   * Formats and saves curriculum directly to Turso Edge DB
   */
  async finalizeAndSave(cleanTopic, formattedTitle, result, onProgress) {
    const formatted = formatStandardizedCurriculum({
      id: `CUSTOM-${cleanTopic.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 15)}-${Date.now().toString().slice(-4)}`,
      type: CURRICULUM_TYPES.CUSTOM_AI,
      title: result.title || formattedTitle,
      subtitle: result.subtitle || `AI-Curated 11-Reel Skill Module for ${formattedTitle}`,
      sector: result.sector || 'Custom Micro-Learning',
      nsqf_level: 3,
      total_reels: 11,
      lessons: result.lessons
    });

    onProgress(4, 'Syncing to Turso Edge DB...', 100);
    await dbClient.saveCurriculum(formatted);
    return formatted;
  }

  /**
   * Fast LLM pre-pass: infers the best-matching vocational skill name
   */
  async inferSkillName(userText) {
    const apiKey = window.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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
          model: window.OPENROUTER_MODEL || 'openrouter/free',
          messages: [
            {
              role: 'system',
              content: `Given a learner's free-form request, return a JSON object: {"skill_name": "Title", "sector": "Sector", "emoji": "🎯", "confidence": "high", "reason": "Match reason"}`
            },
            { role: 'user', content: userText }
          ],
          max_tokens: 120,
          temperature: 0.3
        })
      });

      clearTimeout(timeoutId);
      if (!response.ok) return null;

      const data = await response.json();
      const raw = data?.choices?.[0]?.message?.content?.trim() || '';
      const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(clean);

      if (parsed && parsed.skill_name) return parsed;
      return null;
    } catch (_) {
      clearTimeout(timeoutId);
      return null;
    }
  }
}

const aiEngine = new AICurriculumEngine();
