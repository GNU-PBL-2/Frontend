import { getToken } from "@/utils/auth";

const BASE_URL = "http://localhost:8080";

function authHeaders(): Record<string, string> {
  const token = getToken();
  const base: Record<string, string> = { "Content-Type": "application/json" };
  if (token) base["Authorization"] = `Bearer ${token}`;
  return base;
}

export type UserPreferences = {
  allergies: string[];
  tastes: string[];
  categories: string[];
};

export async function updateUserPreferences(data: UserPreferences): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/users`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`설정 저장 실패: ${res.status}`);
}
