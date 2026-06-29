"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ATTENDANCE_STATUS_LABELS } from "@/types";
import type { AttendanceWithMember, AttendanceStatus } from "@/types";

interface AttendanceRowProps {
  attendance: AttendanceWithMember;
  onDeleted: (id: string) => void;
  onUpdated: (updated: AttendanceWithMember) => void;
}

export function AttendanceRow({ attendance, onDeleted, onUpdated }: AttendanceRowProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);

  const handleStatusChange = async (newStatus: AttendanceStatus) => {
    const res = await fetch(`/api/attendances/${attendance.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, note: attendance.note }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdated(updated);
    }
    setEditingStatus(false);
  };

  const handleDelete = async () => {
    await fetch(`/api/attendances/${attendance.id}`, { method: "DELETE" });
    onDeleted(attendance.id);
    setShowConfirm(false);
  };

  const statusColors: Record<AttendanceStatus, string> = {
    ATTENDING: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-600",
    PENDING: "bg-yellow-100 text-yellow-700",
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 text-sm font-medium text-gray-900">{attendance.member.name}</td>
        <td className="px-4 py-3">
          {editingStatus ? (
            <select
              autoFocus
              defaultValue={attendance.status}
              onBlur={() => setEditingStatus(false)}
              onChange={(e) => handleStatusChange(e.target.value as AttendanceStatus)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="ATTENDING">参加予定</option>
              <option value="ABSENT">欠席</option>
              <option value="PENDING">未回答</option>
            </select>
          ) : (
            <button onClick={() => setEditingStatus(true)}>
              <span
                className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full cursor-pointer ${
                  statusColors[attendance.status as AttendanceStatus] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {ATTENDANCE_STATUS_LABELS[attendance.status as AttendanceStatus]}
              </span>
            </button>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{attendance.note || "—"}</td>
        <td className="px-4 py-3 text-right">
          <button onClick={() => setShowConfirm(true)} className="text-red-600 hover:underline text-xs">
            削除
          </button>
        </td>
      </tr>
      {showConfirm && (
        <ConfirmDialog
          title="参加記録を削除"
          message={`「${attendance.member.name}」の参加記録を削除します。`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
