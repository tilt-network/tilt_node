import { Option } from "../types.js";

export interface User {
  id: Option<string>;
  name: string;
  username: Option<string>;
  email: Option<string>;
  image: Option<string>;
  phone: string;
  role: Option<string>;
  updatedAt: Option<Date>;
  createdAt: Option<Date>;
}

export function userFromJson(data: Record<string, unknown>): User {
  return {
    id: data["id"] ? String(data["id"]) : null,
    name: String(data["name"]),
    username: data["username"] ? String(data["username"]) : null,
    email: data["email"] ? String(data["email"]) : null,
    image: data["image"] ? String(data["image"]) : null,
    phone: String(data["phone"]),
    role: data["role"] ? String(data["role"]) : null,
    updatedAt: data["updated_at"] ? new Date(String(data["updated_at"])) : null,
    createdAt: data["created_at"] ? new Date(String(data["created_at"])) : null,
  };
}
