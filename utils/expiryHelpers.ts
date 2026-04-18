import type { Category } from "@/types/ingredient";

// expiryDate(유통기한)를 직접 받아서 D-day 계산
export function getDaysLeft(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diff = expiry.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// 유통기한 상태 반환 (D-day 기준)
export function getExpiryStatus(expiryDate: string): "expired" | "danger" | "warning" | "safe" {
  const daysLeft = getDaysLeft(expiryDate);
  if (daysLeft < 0) return "expired";   // 유통기한 초과
  if (daysLeft <= 3) return "danger";   // 폐기임박 (D-3 이하)
  if (daysLeft <= 7) return "warning";  // 소비권장 (D-7 이하)
  return "safe";
}