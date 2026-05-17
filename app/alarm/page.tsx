"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import AlarmItemCard from "@/components/alarm/AlarmItemCard";
import Toast from "@/components/Toast";
import { type AlarmItem } from "@/data/alarmUtils";
import { useToast } from "@/hooks/useToast";
import {
  fetchNotifications,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/dashboardApi";

function toAlarmItem(n: NotificationItem): AlarmItem {
  const createdAt = new Date(n.createdAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    createdAt.getFullYear() === today.getFullYear() &&
    createdAt.getMonth() === today.getMonth() &&
    createdAt.getDate() === today.getDate();
  const isYesterday =
    createdAt.getFullYear() === yesterday.getFullYear() &&
    createdAt.getMonth() === yesterday.getMonth() &&
    createdAt.getDate() === yesterday.getDate();

  const diffMs = Date.now() - createdAt.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  let createdAtLabel: string;
  if (diffMin < 1) createdAtLabel = "방금 전";
  else if (diffMin < 60) createdAtLabel = `${diffMin}분 전`;
  else {
    const diffH = Math.floor(diffMin / 60);
    createdAtLabel = diffH < 24 ? `${diffH}시간 전` : `${Math.floor(diffH / 24)}일 전`;
  }

  const days = n.daysUntilExpiry;
  let message: string;
  if (days < 0) message = `${n.ingredientName}의 유통기한이 ${Math.abs(days)}일 지났습니다.`;
  else if (days === 0) message = `${n.ingredientName}의 유통기한이 오늘까지입니다.`;
  else message = `${n.ingredientName} 유통기한이 ${days}일 남았습니다.`;

  return {
    id: String(n.notificationId),
    type: "expiry_warning",
    title: n.ingredientName,
    message,
    createdAtLabel,
    section: isToday ? "오늘" : isYesterday ? "어제" : "이전 알림",
    isRead: n.isRead,
  };
}

export default function AlarmPage() {
  const [alarmItems, setAlarmItems] = useState<AlarmItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const { toastMessage, toastVisible, showToast } = useToast();

  async function loadNotifications(options?: { showLoading?: boolean }) {
    if (options?.showLoading) setLoading(true);
    setError(false);
    try {
      const data = await fetchNotifications();
      setAlarmItems(data.map(toAlarmItem));
    } catch {
      setError(true);
    } finally {
      if (options?.showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications({ showLoading: true });
  }, []);

  const groupedAlarms = {
    오늘: alarmItems.filter((item) => item.section === "오늘"),
    어제: alarmItems.filter((item) => item.section === "어제"),
    "이전 알림": alarmItems.filter((item) => item.section === "이전 알림"),
  };

  const unreadCount = alarmItems.filter((item) => !item.isRead).length;

  const handleMarkRead = async (id: string) => {
    const previous = alarmItems;
    setAlarmItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );

    try {
      await markNotificationRead(Number(id));
    } catch {
      setAlarmItems(previous);
      showToast("읽음 처리에 실패했어요. 다시 시도해 주세요.");
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingRead) return;

    const previous = alarmItems;
    const unreadIds = alarmItems.filter((item) => !item.isRead).map((item) => Number(item.id));
    setIsMarkingRead(true);
    setAlarmItems((prev) => prev.map((item) => ({ ...item, isRead: true })));

    const results = await Promise.allSettled(unreadIds.map(markNotificationRead));
    if (results.some((result) => result.status === "rejected")) {
      setAlarmItems(previous);
      showToast("모두 읽기 처리에 실패했어요. 다시 시도해 주세요.");
    }
    setIsMarkingRead(false);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await loadNotifications();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen flex justify-center">
        <div className="w-full max-w-sm bg-white min-h-screen flex items-center justify-center">
          <p className="text-sm text-gray-400">알림을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen px-4 pt-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">알림</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="text-sm font-medium text-gray-500 disabled:text-gray-300"
              disabled={isRefreshing}
            >
              {isRefreshing ? "새로고침 중..." : "새로고침"}
            </button>
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-medium text-blue-500 disabled:text-gray-300"
              disabled={unreadCount === 0 || isMarkingRead}
            >
              {isMarkingRead ? "처리 중..." : "모두 읽기"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="h-[60vh] flex items-center justify-center text-sm text-red-400">
            알림을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </div>
        ) : alarmItems.length === 0 ? (
          <div className="pt-[34vh] text-center text-sm text-gray-400">
            새로운 알림이 없습니다
          </div>
        ) : (
          <div className="space-y-6">
            {groupedAlarms.오늘.length > 0 && (
              <section>
                <p className="text-xs text-gray-400 mb-2">오늘</p>
                <div className="space-y-3">
                  {groupedAlarms.오늘.map((item) => (
                    <AlarmItemCard key={item.id} item={item} onMarkRead={handleMarkRead} />
                  ))}
                </div>
              </section>
            )}

            {groupedAlarms.어제.length > 0 && (
              <section>
                <p className="text-xs text-gray-400 mb-2">어제</p>
                <div className="space-y-3">
                  {groupedAlarms.어제.map((item) => (
                    <AlarmItemCard key={item.id} item={item} onMarkRead={handleMarkRead} />
                  ))}
                </div>
              </section>
            )}

            {groupedAlarms["이전 알림"].length > 0 && (
              <section>
                <p className="text-xs text-gray-400 mb-2">이전 알림</p>
                <div className="space-y-3">
                  {groupedAlarms["이전 알림"].map((item) => (
                    <AlarmItemCard key={item.id} item={item} onMarkRead={handleMarkRead} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <BottomNav />
        <Toast message={toastMessage} visible={toastVisible} />
      </div>
    </div>
  );
}
