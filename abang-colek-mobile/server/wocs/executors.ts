import { createLandingVersion, getAppConfig, upsertAppConfig, createWocsTaskLog } from "../wocs-db";

type ExecutorResult = {
  ok: boolean;
  message?: string;
  data?: Record<string, unknown>;
};

export async function executeTask(
  taskId: string,
  type: string,
  payload: Record<string, unknown>,
): Promise<ExecutorResult> {
  if (type === "landing_page") {
    const pageSlug = String(payload.pageSlug ?? "default");
    const content = JSON.stringify(payload.content ?? {});
    await createLandingVersion({
      pageSlug,
      version: Date.now(),
      content,
      status: "draft",
    });
    return { ok: true, message: `Landing version saved for ${pageSlug}` };
  }

  if (type === "app_config") {
    const appName = String(payload.appName ?? "abang-colek");
    const configKey = String(payload.configKey ?? "featureFlags");
    const previous = await getAppConfig(appName, configKey);
    const configValue = JSON.stringify(payload.configValue ?? payload);
    await upsertAppConfig({
      appName,
      configKey,
      configValue,
    });
    await createWocsTaskLog({
      taskId,
      action: "config_updated",
      details: JSON.stringify({ previous }),
    });
    return { ok: true, message: `Config ${configKey} updated` };
  }

  if (type === "agent_task") {
    return { ok: true, message: "Agent task recorded", data: payload };
  }

  if (type === "content_schedule") {
    return { ok: true, message: "Content scheduled", data: payload };
  }

  if (type === "report") {
    return { ok: true, message: "Report generated", data: payload };
  }

  if (type === "tiktok") {
    return { ok: true, message: "TikTok task queued", data: payload };
  }

  return { ok: false, message: "Unknown task type" };
}
