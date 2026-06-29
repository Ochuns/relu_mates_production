"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white animate-in slide-in-from-bottom-2">
      <div
        className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
          type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
