import { readFileSync } from "fs";
import { basename } from "path";
import {
  jobsEndpoint,
  programsEndpoint,
  runTaskEndpoint,
  skSigningEndpoint,
  tasksEndpoint,
} from "./endpoints.js";
import { SkSignInResponse, skSignInResponseFromJson } from "./entities/auth.js";
import { Job, jobFromJson } from "./entities/job.js";
import { Task, taskFromJson } from "./entities/task.js";
import { Options } from "./options.js";
import { Err, Ok, Option, Result, TiltError, unwrapOption } from "./types.js";

type JsonValue = Record<string, unknown>;

async function handleResponse(
  resp: Response,
  expectedStatus: number,
  context: string,
): Promise<Result<JsonValue, TiltError>> {
  if (resp.status !== expectedStatus) {
    const body = await resp.text();
    return new Err({ message: `${context} Invalid response status ${resp.status}: ${body}` });
  }
  try {
    const data = (await resp.json()) as JsonValue;
    return new Ok(data);
  } catch (e) {
    return new Err({ message: `${context} Failed to parse JSON: ${e}` });
  }
}

async function handleParsedResponse<T>(
  resp: Response,
  expectedStatus: number,
  fromJson: (data: JsonValue) => T,
  context: string,
): Promise<Result<T, TiltError>> {
  const result = await handleResponse(resp, expectedStatus, context);
  if (result.isErr()) return result;
  try {
    return new Ok(fromJson(result.value));
  } catch (e) {
    return new Err({ message: `${context} Invalid response format: ${e}` });
  }
}

export class Connection {
  constructor(private readonly options: Options) {}

  private authHeader(): string {
    return `Bearer ${unwrapOption(this.options.authToken)}`;
  }

  async skSignIn(sk: string): Promise<Result<SkSignInResponse, TiltError>> {
    const url = skSigningEndpoint(this.options.baseUrl);
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret_key: sk }),
    });
    return handleParsedResponse(resp, 200, skSignInResponseFromJson, "(sk_sign_in)");
  }

  async createJob(name: Option<string> = null, status = "pending"): Promise<Result<Job, TiltError>> {
    const url = jobsEndpoint(this.options.baseUrl);
    const payload = {
      organization_id: this.options.organizationId,
      name,
      status,
      total_tokens: 0,
      program_id: this.options.programId,
    };
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return handleParsedResponse(resp, 201, jobFromJson, "(create_job)");
  }

  async createTask(
    jobId: string,
    index: number,
    status = "pending",
  ): Promise<Result<Task, TiltError>> {
    const url = tasksEndpoint(this.options.baseUrl);
    const payload = { job_id: jobId, segment_index: index, status };
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return handleParsedResponse(resp, 201, taskFromJson, "(create_task)");
  }

  async runTask(taskId: string, data: Buffer): Promise<Result<Task, TiltError>> {
    const url = runTaskEndpoint(this.options.baseUrl);
    const form = new FormData();
    form.append("task_id", taskId);
    form.append("data", new Blob([data]), "data.dat");
    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: this.authHeader() },
      body: form,
    });
    return handleParsedResponse(resp, 200, taskFromJson, "(run_task)");
  }

  async uploadProgram(
    filepath: string,
    name: Option<string> = null,
    description: Option<string> = null,
  ): Promise<void> {
    const url = programsEndpoint(this.options.baseUrl);
    const fileData = readFileSync(filepath);
    const form = new FormData();
    form.append("program", new Blob([fileData], { type: "application/octet-stream" }), basename(filepath));
    form.append("organization_id", unwrapOption(this.options.organizationId));
    if (name) form.append("name", name);
    if (description) form.append("description", description);
    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: this.authHeader() },
      body: form,
    });
    if (resp.status !== 200) {
      const body = await resp.text();
      throw new Error(`Upload program failed: ${resp.status}: ${body}`);
    }
  }
}
