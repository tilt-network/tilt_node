import { Connection } from "./connection.js";
import { Options } from "./options.js";
import { ProcessedData } from "./processed_data.js";
import { Err, Ok, Option, isSome, unwrapOption, unwrapOrOption } from "./types.js";

type TaskStatus = "pending" | "running" | "finished" | "failed";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class LiveRenderer {
  private lastLineCount = 0;

  render(statuses: TaskStatus[], completed: number, total: number): void {
    const width = process.stderr.columns ?? 80;
    const lines: string[] = [];

    for (let i = 0; i < statuses.length; i++) {
      const label = `Task ${String(i).padStart(3, "0")}`;
      const status = statuses[i]!;
      const statusStr = status.charAt(0).toUpperCase() + status.slice(1);
      const dotsCount = Math.max(1, width - label.length - statusStr.length - 4);
      const dots = ".".repeat(dotsCount);

      const color =
        status === "pending"
          ? "\x1b[33m"
          : status === "running"
            ? "\x1b[34m"
            : status === "finished"
              ? "\x1b[32m"
              : "\x1b[31m";

      lines.push(`\x1b[1m${label}\x1b[0m ${dots} ${color}${statusStr}\x1b[0m`);
    }

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const barWidth = Math.max(10, width - 30);
    const filled = total > 0 ? Math.round((completed / total) * barWidth) : 0;
    const bar = "█".repeat(filled) + "░".repeat(barWidth - filled);
    lines.push(`\x1b[1mProcessing tasks:\x1b[0m [${bar}] ${pct}% ${completed}/${total}`);

    // move cursor up by the number of lines written last time, then overwrite
    const moveUp = this.lastLineCount > 0 ? `\x1b[${this.lastLineCount}A` : "";
    process.stderr.write(moveUp + lines.map((l) => `\x1b[2K${l}`).join("\n") + "\n");
    this.lastLineCount = lines.length;
  }

  stop(): void {
    // leave cursor below the last rendered frame
  }
}

export class Tilt {
  private readonly conn: Connection;
  organizationId: Option<string> = null;

  private constructor(private readonly options: Options) {
    this.conn = new Connection(options);
  }

  static async create(options: Options): Promise<Tilt> {
    if (
      (options.dataSrc === null && options.data === null) ||
      options.programId === null
    ) {
      throw new Error("Either dataSrc or data must be provided, and programId is required");
    }
    if (!isSome(options.secretKey)) {
      throw new Error("Secret key must be provided");
    }

    const instance = new Tilt(options);
    const result = await instance.conn.skSignIn(options.secretKey);
    if (result.isErr()) {
      throw new Error(`Sign in failed: ${result.value.message}`);
    }
    options.authToken = result.value.token;
    options.organizationId = result.value.organization.id;
    instance.organizationId = options.organizationId;
    return instance;
  }

  async uploadProgram(
    filepath: string,
    name: Option<string> = null,
    description: Option<string> = null,
  ): Promise<void> {
    return this.conn.uploadProgram(filepath, name, description);
  }

  async poll(jobId: string, taskId: string, segmentIndex: number): Promise<Buffer> {
    const limit = 20;
    for (let count = 0; count < limit; count++) {
      try {
        const processedData = new ProcessedData(
          unwrapOrOption(this.organizationId, ""),
          jobId,
          taskId,
          unwrapOrOption(this.options.authToken, ""),
          this.options.baseUrl,
        );
        return await processedData.download();
      } catch {
        await sleep(2000);
      }
    }
    throw new Error(`Segment ${segmentIndex} timeout`);
  }

  private async processChunk(
    jobId: string,
    index: number,
    chunk: Buffer,
    statuses: TaskStatus[],
  ): Promise<Buffer> {
    statuses[index] = "running";

    const taskResult = await this.conn.createTask(jobId, index);
    if (taskResult.isErr()) {
      statuses[index] = "failed";
      throw new Error(`(process_chunk) Failed to create task: ${taskResult.value.message}`);
    }
    const task = taskResult.value;
    if (!isSome(task.id)) {
      statuses[index] = "failed";
      throw new Error("(process_chunk) Task ID doesn't exist");
    }
    const taskId = task.id;

    await this.conn.runTask(taskId, chunk);
    const result = await this.poll(jobId, taskId, index);

    statuses[index] = "finished";
    return result;
  }

  async createAndPoll(
    jobName = "",
    maxWorkers = 16,
  ): Promise<Array<[number, Option<Buffer>]>> {
    let data: Buffer[];
    if (isSome(this.options.data)) {
      data = this.options.data;
    } else if (isSome(this.options.dataSrc)) {
      data = this.options.dataSrc.jsonlToBufferList();
    } else {
      throw new Error("No data provided");
    }

    const jobResult = await this.conn.createJob(jobName || null);
    if (jobResult.isErr()) {
      throw new Error(`Failed to create job: ${jobResult.value.message}`);
    }
    const job = jobResult.value;
    if (!isSome(job.id)) {
      throw new Error("Job ID missing");
    }
    const jobId = job.id;

    const statuses: TaskStatus[] = new Array(data.length).fill("pending");
    const results: Array<[number, Option<Buffer>]> = [];
    let completed = 0;

    const live = new LiveRenderer();
    live.render(statuses, completed, data.length);

    const renderInterval = setInterval(() => {
      live.render(statuses, completed, data.length);
    }, 100);

    const queue = data.map((chunk, idx) => ({ idx, chunk }));
    let queuePos = 0;

    const runWorker = async (): Promise<void> => {
      while (queuePos < queue.length) {
        const item = queue[queuePos++];
        if (!item) break;
        const { idx, chunk } = item;
        try {
          const res = await this.processChunk(jobId, idx, chunk, statuses);
          results.push([idx, res]);
        } catch (e) {
          statuses[idx] = "failed";
          results.push([idx, null]);
        } finally {
          completed++;
        }
      }
    };

    const workers = Array.from({ length: Math.min(maxWorkers, data.length) }, runWorker);
    await Promise.all(workers);

    clearInterval(renderInterval);
    live.render(statuses, completed, data.length);
    live.stop();

    return results.sort(([a], [b]) => a - b);
  }
}
