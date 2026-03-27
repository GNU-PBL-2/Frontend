"use client";

import type { AlarmItem } from "@/data/alarmUtils";

type AlarmItemCardProps = {
  item: AlarmItem;
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

export default function AlarmItemCard({ item }: AlarmItemCardProps) {
  return (
    <div
      className={`relative rounded-2xl border shadow-sm overflow-hidden transition-colors ${
        item.isRead
          ? "border-gray-100 bg-gray-50"
          : "border-gray-200 bg-white"
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