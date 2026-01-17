import { getWocsTaskLogs, upsertAppConfig } from "../wocs-db";

export async function rollbackTask(taskId: string): Promise<{ ok: boolean; message: string }> {
  const logs = await getWocsTaskLogs(taskId);
  const configLog = logs.find((log) => log.action === "config_updated");
  if (!configLog || !configLog.details) {
    return { ok: false, message: "No rollback data found" };
  }

  try {
    const details = JSON.parse(configLog.details) as { previous?: any };
    const previous = details.previous;
    if (!previous) {
      return { ok: false, message: "Previous config missing" };
    }

    await upsertAppConfig({
      appName: previous.appName,
      configKey: previous.configKey,
      configValue: previous.configValue,
    });

    return { ok: true, message: "Rollback applied" };
  } catch (error) {
    return { ok: false, message: "Rollback failed" };
  }
}
