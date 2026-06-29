"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EVENT_STATUS_LABELS } from "@/types";
import type { Event } from "@/types";

interface EventWithCount extends Event {
  _count: { attendances: number };
}

interface EventRowProps {
  event: EventWithCount;
  onDeleted: (id: string) => void;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EventRow({ event, onDeleted }: EventRowProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    onDeleted(event.id);
    setShowConfirm(false);
  };

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-600",
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 text-sm font-medium text-gray-900">
          <Link href={`/events/${event.id}`} className="hover:underline text-blue-700">
            {event.title}
          </Link>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(event.startAt)}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{event.location || "—"}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[event.status] ?? "bg-gray-100 text-gray-600"}`}
          >
            {EVENT_STATUS_LABELS[event.status as keyof typeof EVENT_STATUS_LABELS]}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 text-center">{event._count.attendances}</td>
        <td className="px-4 py-3 text-sm text-right space-x-2">
          <Link href={`/events/${event.id}/edit`} className="text-blue-600 hover:underline text-xs">
            編集
          </Link>
          <button onClick={() => setShowConfirm(true)} className="text-red-600 hover:underline text-xs">
            削除
          </button>
        </td>
      </tr>
      {showConfirm && (
        <ConfirmDialog
          title="イベントを削除"
          message={`「${event.title}」を削除します。関連する出欠記録も削除されます。`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
