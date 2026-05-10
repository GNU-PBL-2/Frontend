const TOKEN_KEY = "access_token";

export function setToken(token: string): void {
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
}

export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeToken(): void {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
}

export function getUserIdFromToken(): number | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    // Try common field names; accept string or number values
    const raw = payload.user_id ?? payload.userId ?? payload.memberId ?? null;
    if (raw == null) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
