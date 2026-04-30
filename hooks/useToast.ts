import { useState, useRef, useEffect } from "react";

export function useToast() {
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function showToast(message: string) {
    setToastMessage(message);
    setToastVisible(false);
    // setTimeout(() => setToastVisible(true), 10);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToastVisible(true), 10);
  }

  return { toastMessage, toastVisible, showToast };
}