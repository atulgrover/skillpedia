/**
 * SkillPedia Content Moderation & Safety Filter (Tier 1 Guardrails)
 */

const SAFETY_BLACKLIST = [
  // Weapons & Explosives
  'bomb', 'explosive', 'grenade', 'dynamite', 'gun', 'firearm', 'ammunition', 'weapon',
  'detonator', 'ied', 'poison', 'toxic chemical', 'biohazard',
  // Illegal & Harmful Acts
  'hacking', 'ransomware', 'malware', 'phishing', 'counterfeit', 'illicit drug',
  'meth', 'cocaine', 'heroin', 'suicide', 'self-harm', 'assassination',
  // Explicit / Adult Content
  'porn', 'porno', 'pornography', 'xxx', 'erotic', 'nsfw', 'naked', 'sex video'
];

/**
 * Checks if a user prompt violates platform safety policies
 * @param {string} prompt 
 * @returns {object} { safe: boolean, reason?: string }
 */
function sanitizeAndCheckPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return { safe: false, reason: 'Please enter a valid skill learning topic.' };
  }

  const cleanPrompt = prompt.trim().toLowerCase();
  
  if (cleanPrompt.length < 3) {
    return { safe: false, reason: 'Topic description is too short. Please enter a specific skill.' };
  }

  // Check against safety blacklist keywords
  for (const term of SAFETY_BLACKLIST) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(cleanPrompt)) {
      return {
        safe: false,
        reason: `SkillPedia is a vocational skill learning portal. The topic "${term}" violates our community safety guidelines.`
      };
    }
  }

  return { safe: true };
}
