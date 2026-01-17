import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

type QueueConfig = {
  redisUrl?: string;
};

let queue: Queue | null = null;
let worker: Worker | null = null;

export function getQueue(config: QueueConfig) {
  if (queue) return queue;
  if (!config.redisUrl) {
    return null;
  }
  const connection = new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
  });
  queue = new Queue("wocs-tasks", { connection });
  return queue;
}

export function registerWorker(
  config: QueueConfig,
  processor: (job: { data: { taskId: string } }) => Promise<void>,
) {
  if (worker || !config.redisUrl) return;
  const connection = new IORedis(config.redisUrl, {
    maxRetriesPerRequest: null,
  });
  worker = new Worker("wocs-tasks", async (job) => processor(job), { connection });
}
