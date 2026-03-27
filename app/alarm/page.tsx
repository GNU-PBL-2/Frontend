"use client";

import { useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import AlarmItemCard from "@/components/alarm/AlarmItemCard";
import {
  generateAlarmItems,
  groupAlarmItemsBySection,
  type AlarmItem,
} from "@/data/alarmUtils";

export default function AlarmPage() {
  const [alarmItems, setAlarmItems] = useState<AlarmItem[]>(generateAlarmItems());

  const groupedAlarms = useMemo(() => {
    return groupAlarmItemsBySection(alarmItems);
  }, [alarmItems]);

  const unreadCount = alarmItems.filter((item) => !item.isRead).length;

  const handleMarkAllRead = () => {
    setAlarmItems((prev) =>
      prev.map((item) => ({
        ...item,
        isRead: true,
      }))
    );
  };

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

        {alarmItems.length === 0 ? (
          <div className="h-[60vh] flex items-center justify-center text-sm text-gray-400">
            새로운 알림이 없습니다
          </div>
        ) : (
          <div className="space-y-6">
            {groupedAlarms.오늘.length > 0 && (
              <section>
                <p className="text-xs text-gray-400 mb-2">방금 전</p>
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