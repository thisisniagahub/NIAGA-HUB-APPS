import { z } from "zod";

import { publicProcedure, router } from "./_core/trpc";
import {
  createWocsTask,
  createWocsTaskLog,
  generateTaskId,
  getAllWocsTasks,
  getWocsTask,
  getWocsTaskLogs,
  updateWocsTaskStatus,
} from "./wocs-db";
import { enqueueTask, runTaskNow } from "./wocs/taskEngine";
import { rollbackTask } from "./wocs/rollback";
import { taskTemplates } from "./wocs/templates";
import { parseVoiceCommand } from "./wocs/voice";

export const wocsRouter = router({
  list: publicProcedure.query(async () => getAllWocsTasks()),
  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return getWocsTask(input.id);
  }),
  logs: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return getWocsTaskLogs(input.id);
  }),
  create: publicProcedure
    .input(
      z.object({
        type: z.string(),
        commandRaw: z.string(),
        payload: z.record(z.unknown()).default({}),
        requiresApproval: z.boolean().default(false),
        scheduledAt: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const taskId = await generateTaskId();
      await createWocsTask({
        id: taskId,
        type: input.type,
        commandRaw: input.commandRaw,
        payload: JSON.stringify(input.payload),
        status: input.requiresApproval ? "awaiting_approval" : "pending",
        priority: "normal",
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      });
      await createWocsTaskLog({
        taskId,
        action: "created",
        details: JSON.stringify({ payload: input.payload }),
      });
      if (!input.requiresApproval) {
        await enqueueTask(taskId);
      }
      return { id: taskId };
    }),
  approve: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await updateWocsTaskStatus(input.id, "pending");
      await createWocsTaskLog({ taskId: input.id, action: "approved" });
      await enqueueTask(input.id);
      return { ok: true };
    }),
  reject: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await updateWocsTaskStatus(input.id, "cancelled");
      await createWocsTaskLog({ taskId: input.id, action: "rejected" });
      return { ok: true };
    }),
  runNow: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await runTaskNow(input.id);
      return { ok: true };
    }),
  stats: publicProcedure.query(async () => {
    const tasks = await getAllWocsTasks(200);
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      awaitingApproval: tasks.filter((t) => t.status === "awaiting_approval").length,
      running: tasks.filter((t) => t.status === "running").length,
      done: tasks.filter((t) => t.status === "done").length,
      failed: tasks.filter((t) => t.status === "failed").length,
    };
  }),
  templates: publicProcedure.query(() => taskTemplates),
  createFromTemplate: publicProcedure
    .input(z.object({ templateId: z.string() }))
    .mutation(async ({ input }) => {
      const template = taskTemplates.find((t) => t.id === input.templateId);
      if (!template) {
        throw new Error("Template not found");
      }
      const taskId = await generateTaskId();
      await createWocsTask({
        id: taskId,
        type: template.type,
        commandRaw: `template:${template.id}`,
        payload: JSON.stringify(template.payload),
        status: "pending",
        priority: "normal",
      });
      await createWocsTaskLog({
        taskId,
        action: "created",
        details: JSON.stringify({ template: template.id }),
      });
      await enqueueTask(taskId);
      return { id: taskId };
    }),
  batchCreate: publicProcedure
    .input(
      z.array(
        z.object({
          type: z.string(),
          commandRaw: z.string(),
          payload: z.record(z.unknown()).default({}),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      const created = [];
      for (const item of input) {
        const taskId = await generateTaskId();
        await createWocsTask({
          id: taskId,
          type: item.type,
          commandRaw: item.commandRaw,
          payload: JSON.stringify(item.payload),
          status: "pending",
          priority: "normal",
        });
        await createWocsTaskLog({
          taskId,
          action: "created",
          details: JSON.stringify({ batch: true }),
        });
        await enqueueTask(taskId);
        created.push(taskId);
      }
      return { created };
    }),
  rollback: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const result = await rollbackTask(input.id);
      await updateWocsTaskStatus(input.id, result.ok ? "rolled_back" : "failed");
      return result;
    }),
  voiceParse: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(({ input }) => {
      return parseVoiceCommand(input.text);
    }),
});
