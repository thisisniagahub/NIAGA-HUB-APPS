export type ParsedCommand = {
  type:
    | "landing_page"
    | "app_config"
    | "agent_task"
    | "content_schedule"
    | "report"
    | "tiktok"
    | "unknown";
  payload: Record<string, unknown>;
  raw: string;
  requiresApproval: boolean;
};

function parseKeyValuePairs(tokens: string[]) {
  return tokens.reduce<Record<string, string>>((acc, token) => {
    const [key, ...rest] = token.split("=");
    if (!key || rest.length === 0) return acc;
    acc[key.trim()] = rest.join("=").trim();
    return acc;
  }, {});
}

export function parseCommand(raw: string): ParsedCommand {
  const trimmed = raw.trim();
  const normalized = trimmed.replace(/^\/+/, "");
  const [keyword, ...rest] = normalized.split(/\s+/);
  const payload = parseKeyValuePairs(rest);

  if (!keyword) {
    return { type: "unknown", payload: {}, raw, requiresApproval: false };
  }

  if (keyword === "landing") {
    return {
      type: "landing_page",
      payload,
      raw,
      requiresApproval: true,
    };
  }

  if (keyword === "config") {
    return {
      type: "app_config",
      payload,
      raw,
      requiresApproval: true,
    };
  }

  if (keyword === "assign") {
    return {
      type: "agent_task",
      payload,
      raw,
      requiresApproval: false,
    };
  }

  if (keyword === "schedule") {
    return {
      type: "content_schedule",
      payload,
      raw,
      requiresApproval: false,
    };
  }

  if (keyword === "report") {
    return {
      type: "report",
      payload,
      raw,
      requiresApproval: false,
    };
  }

  if (keyword === "tiktok") {
    return {
      type: "tiktok",
      payload,
      raw,
      requiresApproval: false,
    };
  }

  return { type: "unknown", payload: {}, raw, requiresApproval: false };
}
