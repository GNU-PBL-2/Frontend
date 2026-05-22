"use client";

import { useNotificationPolling } from "@/hooks/useNotificationPolling";

export default function NotificationSubscriber() {
  useNotificationPolling();
  return null;
}
