"use client";

import type { AlarmItem } from "@/data/alarmUtils";

type AlarmItemCardProps = {
  item: AlarmItem;
  onMarkRead?: (id: string) => void;
};

function getLeftAccentClass(type: AlarmItem["type"], isRead: boolean) {
  if (isRead) return "bg-gray-200";

  switch (type) {
    case "expiry_warning":
      return "bg-red-400";
    default:
      return "bg-gray-300";
  }
}

function getIcon(type: AlarmItem["type"]) {
  switch (type) {
    case "expiry_warning":
      return "";
    default:
      return "🔔";
  }
}

export default function AlarmItemCard({ item, onMarkRead }: AlarmItemCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        if (!item.isRead) onMarkRead?.(item.id);
      }}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !item.isRead) {
          event.preventDefault();
          onMarkRead?.(item.id);
        }
      }}
      className={`relative rounded-2xl border shadow-sm overflow-hidden transition-all duration-150 ${
        item.isRead
          ? "border-gray-100 bg-gray-50 cursor-default"
          : "border-gray-200 bg-white cursor-pointer hover:border-red-100 hover:bg-red-50/30 active:scale-[0.99]"
      }`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-1 ${getLeftAccentClass(
          item.type,
          item.isRead
        )}`}
      />

      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
              item.isRead ? "bg-gray-100" : "bg-gray-100"
            }`}
          >
            {getIcon(item.type)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <p className={`text-xs font-bold ${item.isRead ? "text-gray-300" : "text-red-400"}`}>
                유통기한 알림
              </p>
              {!item.isRead && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" aria-label="읽지 않은 알림" />
              )}
            </div>
            <p
              className={`text-sm leading-6 break-words ${
                item.isRead ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {item.message}
            </p>
            <p className={`mt-1 text-xs ${item.isRead ? "text-gray-300" : "text-blue-400"}`}>
              {item.createdAtLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
