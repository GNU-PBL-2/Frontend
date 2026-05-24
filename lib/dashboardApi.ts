import { getToken } from "@/utils/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type UserProfile = {
  publicId: string;
  name: string;
  email: string;
  allergies: string[];
  tastes: string[];
  categories: string[];
};

export type NotificationItem = {
  notificationId: number;
  ingredientName: string;
  expiryDate: string;
  daysUntilExpiry: number;
  isRead: boolean;
  createdAt: string;
};

export type FridgeItem = {
  fridgeId: number;
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  expiryDate: string;
};

export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/api/v1/users`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`프로필 로드 실패: ${res.status}`);
  return res.json();
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${BASE_URL}/api/v1/notifications`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`알림 로드 실패: ${res.status}`);
  return res.json();
}

export async function markNotificationRead(notificationId: number): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${BASE_URL}/api/v1/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: authHeaders(),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`읽음 처리 실패: ${res.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchFridgeItems(userId: number): Promise<FridgeItem[]> {
  const res = await fetch(`${BASE_URL}/api/v1/fridge/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`냉장고 로드 실패: ${res.status}`);
  return res.json();
}
