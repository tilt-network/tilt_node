import { Option } from "../types.js";

export type JobStatus =
  | "pending"
  | "in_progress"
  | "succeeded"
  | "failed"
  | "expired"
  | "canceled";

export interface Job {
  id: Option<string>;
  organizationId: Option<string>;
  programId: Option<string>;
  name: Option<string>;
  status: Option<JobStatus>;
  inputUrl: Option<string>;
  outputUrl: Option<string>;
  totalTokens: Option<number>;
  totalTasks: Option<number>;
  updatedAt: Option<Date>;
  createdAt: Option<Date>;
  completedAt: Option<Date>;
  inProgressAt: Option<Date>;
  expiresAt: Option<Date>;
  failedAt: Option<Date>;
  expiredAt: Option<Date>;
}

function optDate(data: Record<string, unknown>, key: string): Option<Date> {
  return data[key] ? new Date(String(data[key])) : null;
}

export function jobFromJson(data: Record<string, unknown>): Job {
  return {
    id: data["id"] ? String(data["id"]) : null,
    organizationId: data["organization_id"] ? String(data["organization_id"]) : null,
    programId: data["program_id"] ? String(data["program_id"]) : null,
    name: data["name"] ? String(data["name"]) : null,
    status: data["status"] ? (data["status"] as JobStatus) : null,
    inputUrl: data["input_url"] ? String(data["input_url"]) : null,
    outputUrl: data["output_url"] ? String(data["output_url"]) : null,
    totalTokens: data["total_tokens"] != null ? Number(data["total_tokens"]) : null,
    totalTasks: data["total_tasks"] != null ? Number(data["total_tasks"]) : null,
    updatedAt: optDate(data, "updated_at"),
    createdAt: optDate(data, "created_at"),
    completedAt: optDate(data, "completed_at"),
    inProgressAt: optDate(data, "in_progress_at"),
    expiresAt: optDate(data, "expires_at"),
    failedAt: optDate(data, "failed_at"),
    expiredAt: optDate(data, "expired_at"),
  };
}
