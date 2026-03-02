export function estimateTokenCount(input: string): number {
  if (!input) {
    return 0;
  }

  // Keeps truncation stable without requiring provider-specific tokenizers.
  return Math.ceil(input.length / 4);
}

export function truncateToTokenLimit(input: string, maxTokens: number): string {
  const maxChars = Math.max(0, maxTokens * 4);
  if (input.length <= maxChars) {
    return input;
  }
  return input.slice(0, maxChars);
}