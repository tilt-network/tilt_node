export function programsEndpoint(baseUrl: string): string {
  return `${baseUrl}/programs`;
}

export function statusPollingEndpoint(baseUrl: string, taskId: string): string {
  return `${baseUrl}/processed_data_status/${taskId}`;
}

export function downloadProcessedDataEndpoint(
  baseUrl: string,
  organizationId: string,
  jobId: string,
  taskId: string,
): string {
  return `${baseUrl}/processed_data/${organizationId}/${jobId}/processed/${taskId}.dat`;
}

export function sseEndpoint(baseUrl: string, programId: string): string {
  return `${baseUrl}/sse/${programId}`;
}

export function jobsEndpoint(baseUrl: string): string {
  return `${baseUrl}/jobs`;
}

export function tasksEndpoint(baseUrl: string): string {
  return `${baseUrl}/tasks`;
}

export function skSigningEndpoint(baseUrl: string): string {
  return `${baseUrl}/sign_in/api_key`;
}

export function runTaskEndpoint(baseUrl: string): string {
  return `${baseUrl}/tasks/run`;
}
