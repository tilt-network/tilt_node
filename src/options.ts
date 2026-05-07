import { Environment, Option } from "./types.js";
import type { SourceHandler } from "./source_handler.js";

export class Options {
  private _authToken: Option<string> = null;
  private _organizationId: Option<string> = null;

  constructor(
    public readonly dataSrc: Option<SourceHandler> = null,
    public readonly data: Option<Buffer[]> = null,
    public readonly programId: Option<string> = null,
    public readonly secretKey: Option<string> = null,
    public readonly environment: Environment = Environment.PRODUCTION,
  ) {}

  get authToken(): Option<string> {
    return this._authToken;
  }

  set authToken(value: Option<string>) {
    this._authToken = value;
  }

  get organizationId(): Option<string> {
    return this._organizationId;
  }

  set organizationId(value: Option<string>) {
    this._organizationId = value;
  }

  get baseUrl(): string {
    const override = process.env["API_BASE_URL"];
    if (override) return override;
    switch (this.environment) {
      case Environment.PRODUCTION:
        return "https://production.tilt.rest";
      case Environment.DEVELOPMENT:
        return "https://development.tilt.rest";
      case Environment.STAGING:
        return "https://staging.tilt.rest";
    }
  }
}
