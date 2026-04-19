"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  visible: boolean;
};

export default function Toast({ message, visible }: ToastProps) {
  const [show, setShow] = useState(false);

    useEffect(() => {
//     if (visible) {
//       setShow(true);
//       const timer = setTimeout(() => setShow(false), 2500);
//       return () => clearTimeout(timer);
//     }

        if (!visible) {
        setShow(false);
        return;
        }
        setShow(true);
        const timer = setTimeout(() => setShow(false), 2500);
        return () => clearTimeout(timer);
        
    }, [visible, message]);
    

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50">
      <div className="w-full py-3.5 rounded-xl bg-green-700 text-white text-sm font-bold text-center shadow-lg">
        {message}
      </div>
    </div>
  );
}