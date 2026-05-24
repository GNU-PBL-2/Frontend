import { useEffect } from "react";
import { getToken } from "@/utils/auth";
import { fetchNotifications } from "@/lib/dashboardApi";

const POLL_INTERVAL = 5 * 60 * 1000; // 5분
const STORAGE_KEY = "freshkeeper_shown_notif_ids";

function getShownIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

function saveShownIds(ids: number[]) {
  try {
    const current = getShownIds();
    ids.forEach((id) => current.add(id));
    // 최대 200개 유지
    const trimmed = Array.from(current).slice(-200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

function formatBody(ingredientName: string, daysUntilExpiry: number): string {
  if (daysUntilExpiry <= 0) return `${ingredientName}이/가 오늘 만료돼요!`;
  if (daysUntilExpiry === 1) return `${ingredientName}이/가 내일 만료돼요!`;
  return `${ingredientName}이/가 ${daysUntilExpiry}일 후 만료돼요!`;
}

async function checkAndNotify() {
  if (!getToken()) return;
  if (typeof window === "undefined") return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  try {
    const items = await fetchNotifications();
    const shownIds = getShownIds();
    const toShow = items.filter((n) => !n.isRead && !shownIds.has(n.notificationId));

    if (toShow.length === 0) return;

    toShow.forEach((n) => {
      new Notification("🧊 FreshKeeper", {
        body: formatBody(n.ingredientName, n.daysUntilExpiry),
        tag: `notif-${n.notificationId}`, // 같은 tag는 중복 표시 안 됨
      });
    });

    saveShownIds(toShow.map((n) => n.notificationId));
  } catch {}
}

export function useNotificationPolling() {
  useEffect(() => {
    checkAndNotify();
    const id = setInterval(checkAndNotify, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);
}
