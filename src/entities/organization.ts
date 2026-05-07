import { Option } from "../types.js";

export interface Organization {
  id: Option<string>;
  name: string;
  image: Option<string>;
  document: Option<string>;
  scope: string;
  documentType: Option<string>;
  updatedAt: Option<Date>;
  createdAt: Option<Date>;
}

export function organizationFromJson(data: Record<string, unknown>): Organization {
  return {
    id: data["id"] ? String(data["id"]) : null,
    name: String(data["name"]),
    image: data["image"] ? String(data["image"]) : null,
    document: data["document"] ? String(data["document"]) : null,
    scope: String(data["scope"]),
    documentType: data["document_type"] ? String(data["document_type"]) : null,
    updatedAt: data["updated_at"] ? new Date(String(data["updated_at"])) : null,
    createdAt: data["created_at"] ? new Date(String(data["created_at"])) : null,
  };
}
