import { Organization, organizationFromJson } from "./organization.js";
import { User, userFromJson } from "./user.js";

export interface SkSignInResponse {
  token: string;
  user: User;
  organization: Organization;
  expiresAt: Date;
}

export function skSignInResponseFromJson(data: Record<string, unknown>): SkSignInResponse {
  return {
    token: String(data["token"]),
    user: userFromJson(data["user"] as Record<string, unknown>),
    organization: organizationFromJson(data["organization"] as Record<string, unknown>),
    expiresAt: new Date(String(data["expires_at"])),
  };
}
