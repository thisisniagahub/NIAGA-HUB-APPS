import { ENV } from "../_core/env";
import { createWocsTaskLog, getWocsTask, getWocsTasksByStatus, updateWocsTaskStatus } from "../wocs-db";
import { executeTask } from "./executors";
import { getQueue, registerWorker } from "./queue";

const QUEUE_CONFIG = {
  redisUrl: process.env.REDIS_URL,
};

export async function enqueueTask(taskId: string) {
  const queue = getQueue(QUEUE_CONFIG);
  if (!queue) {
    await runTaskNow(taskId);
    return;
  }
  await queue.add("wocs-task", { taskId });
}

export async function runTaskNow(taskId: string) {
  const task = await getWocsTask(taskId);
  if (!task) return;

  await updateWocsTaskStatus(taskId, "running", { startedAt: new Date() });
  await createWocsTaskLog({
    taskId,
    action: "started",
    details: JSON.stringify({ type: task.type }),
  });

  try {
    const payload = JSON.parse(task.payload || "{}") as Record<string, unknown>;
    const result = await executeTask(task.id, task.type, payload);
    await updateWocsTaskStatus(taskId, result.ok ? "done" : "failed", {
      completedAt: new Date(),
      result: JSON.stringify(result),
      errorMessage: result.ok ? null : result.message ?? "Task failed",
    });
    await createWocsTaskLog({
      taskId,
      action: result.ok ? "completed" : "failed",
      details: JSON.stringify(result),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await updateWocsTaskStatus(taskId, "failed", {
      completedAt: new Date(),
      errorMessage: message,
    });
    await createWocsTaskLog({
      taskId,
      action: "failed",
      details: JSON.stringify({ error: message }),
    });
  }
}

export function startWorker() {
  registerWorker(QUEUE_CONFIG, async (job) => {
    await runTaskNow(job.data.taskId);
  });
}

export function startScheduler() {
  setInterval(async () => {
    if (!ENV.databaseUrl) return;
    const pending = await getWocsTasksByStatus("pending");
    const now = Date.now();
    const due = pending.filter((task) => task.scheduledAt && new Date(task.scheduledAt).getTime() <= now);
    for (const task of due) {
      await updateWocsTaskStatus(task.id, "running", { startedAt: new Date() });
      await enqueueTask(task.id);
    }
  }, 30_000);
}
