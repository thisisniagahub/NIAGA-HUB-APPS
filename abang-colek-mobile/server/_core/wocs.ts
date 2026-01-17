import type { Express, Request, Response } from "express";
import { parseCommand } from "../wocs/commandParser";
import { createWocsTask, createWocsTaskLog, generateTaskId, getWocsUserByWaNumber } from "../wocs-db";
import { enqueueTask } from "../wocs/taskEngine";

function extractWhatsAppText(body: any): { text: string; from: string } | null {
  try {
    if (body?.text && body?.from) {
      return { text: String(body.text), from: String(body.from) };
    }
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return null;
    const text = message.text?.body ?? "";
    const from = message.from ?? "";
    if (!text || !from) return null;
    return { text, from };
  } catch {
    return null;
  }
}

export function registerWocsRoutes(app: Express) {
  app.get("/api/wocs/webhook", (req: Request, res: Response) => {
    const verifyToken = process.env.WOCS_VERIFY_TOKEN;
    const mode = req.query["hub.mode"] || req.query["mode"];
    const token = req.query["hub.verify_token"] || req.query["verify_token"];
    const challenge = req.query["hub.challenge"] || req.query["challenge"];

    if (mode === "subscribe" && verifyToken && token === verifyToken) {
      res.status(200).send(challenge);
      return;
    }
    res.status(403).send("Verification failed");
  });

  app.post("/api/wocs/webhook", async (req: Request, res: Response) => {
    const payload = extractWhatsAppText(req.body);
    if (!payload) {
      res.json({ ok: true });
      return;
    }

    const user = await getWocsUserByWaNumber(payload.from);
    if (!user || user.status !== "active") {
      res.status(403).json({ error: "User not authorized" });
      return;
    }

    const parsed = parseCommand(payload.text);
    if (parsed.type === "unknown") {
      res.json({ ok: true, message: "Unknown command" });
      return;
    }

    const taskId = await generateTaskId();
    await createWocsTask({
      id: taskId,
      type: parsed.type,
      commandRaw: parsed.raw,
      payload: JSON.stringify(parsed.payload),
      status: parsed.requiresApproval ? "awaiting_approval" : "pending",
      priority: "normal",
      requestedBy: user.id,
    });

    await createWocsTaskLog({
      taskId,
      action: "created",
      actorId: user.id,
      details: JSON.stringify({ payload: parsed.payload }),
    });

    if (!parsed.requiresApproval) {
      await enqueueTask(taskId);
    }

    res.json({ ok: true, taskId });
  });
}
