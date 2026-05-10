"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import AlarmItemCard from "@/components/alarm/AlarmItemCard";
import { type AlarmItem } from "@/data/alarmUtils";
import { fetchNotifications, type NotificationItem } from "@/lib/dashboardApi";

function toAlarmItem(n: NotificationItem): AlarmItem {
  const createdAt = new Date(n.createdAt);
  const today = new Date();
  const isToday =
    createdAt.getFullYear() === today.getFullYear() &&
    createdAt.getMonth() === today.getMonth() &&
    createdAt.getDate() === today.getDate();

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
    section: isToday ? "오늘" : "어제",
    isRead: n.isRead,
  };
}

export default function AlarmPage() {
  const [alarmItems, setAlarmItems] = useState<AlarmItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchNotifications()
      .then((data) => setAlarmItems(data.map(toAlarmItem)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const groupedAlarms = {
    오늘: alarmItems.filter((item) => item.section === "오늘"),
    어제: alarmItems.filter((item) => item.section === "어제"),
  };

  const unreadCount = alarmItems.filter((item) => !item.isRead).length;

  const handleMarkAllRead = () => {
    setAlarmItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
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
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-blue-500 disabled:text-gray-300"
            disabled={unreadCount === 0}
          >
            모두 읽기
          </button>
        </div>

        {error ? (
          <div className="h-[60vh] flex items-center justify-center text-sm text-red-400">
            알림을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </div>
        ) : alarmItems.length === 0 ? (
          <div className="h-[60vh] flex items-center justify-center text-sm text-gray-400">
            새로운 알림이 없습니다
          </div>
        ) : (
          <div className="space-y-6">
            {groupedAlarms.오늘.length > 0 && (
              <section>
                <p className="text-xs text-gray-400 mb-2">오늘</p>
                <div className="space-y-3">
                  {groupedAlarms.오늘.map((item) => (
                    <AlarmItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {groupedAlarms.어제.length > 0 && (
              <section>
                <p className="text-xs text-gray-400 mb-2">어제</p>
                <div className="space-y-3">
                  {groupedAlarms.어제.map((item) => (
                    <AlarmItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}
