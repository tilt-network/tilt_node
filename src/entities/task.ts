import { Option } from "../types.js";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "succeeded"
  | "failed"
  | "expired"
  | "canceled";

export interface Task {
  id: Option<string>;
  jobId: Option<string>;
  programId: Option<string>;
  segmentIndex: Option<number>;
  status: Option<TaskStatus>;
  resultUrl: Option<string>;
  tokensUsed: Option<number>;
  size: Option<number>;
  organizationId: Option<string>;
  deviceId: Option<string>;
  startedAt: Option<Date>;
  finishedAt: Option<Date>;
  failedAt: Option<Date>;
  expiresAt: Option<Date>;
  expiredAt: Option<Date>;
  updatedAt: Option<Date>;
  createdAt: Option<Date>;
}

function optDate(data: Record<string, unknown>, key: string): Option<Date> {
  return data[key] ? new Date(String(data[key])) : null;
}

export function taskFromJson(data: Record<string, unknown>): Task {
  return {
    id: data["id"] ? String(data["id"]) : null,
    jobId: data["job_id"] ? String(data["job_id"]) : null,
    programId: data["program_id"] ? String(data["program_id"]) : null,
    segmentIndex: data["segment_index"] != null ? Number(data["segment_index"]) : null,
    status: data["status"] ? (data["status"] as TaskStatus) : null,
    resultUrl: data["result_url"] ? String(data["result_url"]) : null,
    tokensUsed: data["tokens_used"] != null ? Number(data["tokens_used"]) : null,
    size: data["size"] != null ? Number(data["size"]) : null,
    organizationId: data["organization_id"] ? String(data["organization_id"]) : null,
    deviceId: data["device_id"] ? String(data["device_id"]) : null,
    startedAt: optDate(data, "started_at"),
    finishedAt: optDate(data, "finished_at"),
    failedAt: optDate(data, "failed_at"),
    expiresAt: optDate(data, "expires_at"),
    expiredAt: optDate(data, "expired_at"),
    updatedAt: optDate(data, "updated_at"),
    createdAt: optDate(data, "created_at"),
  };
}
