export type ChatModelProfile = 'fast' | 'thinking' | 'pro';

const MODEL_CANDIDATES: Record<ChatModelProfile, string[]> = {
  fast: ['gemini-3-flash-preview'],
  thinking: ['gemini-3-flash-preview'],
  pro: ['gemini-3-flash-preview'],
};

// Future re-enable plan when quota/key supports additional free/paid models:
// const MODEL_CANDIDATES: Record<ChatModelProfile, string[]> = {
//   fast: ['gemini-3-flash-preview', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'],
//   thinking: ['gemini-2.5-pro', 'gemini-3-flash-preview', 'gemini-2.0-flash'],
//   pro: ['gemini-2.5-pro', 'gemini-3-flash-preview'],
// };

const MODEL_PROFILE_DEFAULTS: Record<ChatModelProfile, { temperature: number; maxOutputTokens: number }> = {
  fast: { temperature: 0.3, maxOutputTokens: 65536 },
  thinking: { temperature: 0.2, maxOutputTokens: 65536 },
  pro: { temperature: 0.1, maxOutputTokens: 65536 },
};

export function resolveModelCandidates(profile: ChatModelProfile | undefined, defaultModel: string): string[] {
  const base = profile ? MODEL_CANDIDATES[profile] : [];
  if (base.length > 0) {
    return [...new Set(base)];
  }
  return [...new Set([defaultModel, 'gemini-3-flash-preview'].filter(Boolean))];
}

export function resolveModelDefaults(profile: ChatModelProfile | undefined) {
  if (!profile) {
    return { temperature: 0.2, maxOutputTokens: 2048 };
  }
  return MODEL_PROFILE_DEFAULTS[profile];
}
