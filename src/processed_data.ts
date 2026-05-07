import { downloadProcessedDataEndpoint } from "./endpoints.js";

export class ProcessedData {
  constructor(
    private readonly organizationId: string,
    private readonly jobId: string,
    private readonly taskId: string,
    private readonly authToken: string = "",
    private readonly baseUrl: string = "https://production.tilt.rest",
  ) {}

  async download(): Promise<Buffer> {
    const url = downloadProcessedDataEndpoint(
      this.baseUrl,
      this.organizationId,
      this.jobId,
      this.taskId,
    );
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${this.authToken}` },
    });
    if (resp.status !== 200) {
      throw new Error(`Download failed: ${resp.status}`);
    }
    const arrayBuffer = await resp.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
