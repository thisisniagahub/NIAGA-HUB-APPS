import { parseCommand } from "./commandParser";

const NORMALIZE_MAP: Record<string, string> = {
  "buat landing": "landing",
  "update config": "config",
  "assign task": "assign",
  "jadual content": "schedule",
  "buat report": "report",
  "tiktok task": "tiktok",
};

export function normalizeVoiceCommand(text: string) {
  let normalized = text.toLowerCase();
  Object.entries(NORMALIZE_MAP).forEach(([key, value]) => {
    if (normalized.includes(key)) {
      normalized = normalized.replace(key, value);
    }
  });
  return normalized;
}

export function parseVoiceCommand(text: string) {
  const normalized = normalizeVoiceCommand(text);
  const parsed = parseCommand(normalized);
  return {
    normalized,
    parsed,
    needsConfirmation: parsed.type !== "unknown",
  };
}
