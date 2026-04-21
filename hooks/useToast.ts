import { useState } from "react";

export function useToast() {
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(message: string) {
    setToastMessage(message);
    setToastVisible(false);
    setTimeout(() => setToastVisible(true), 10);
  }

  return { toastMessage, toastVisible, showToast };
}