"use client";

import { useState } from "react";
import type { Member, AttendanceWithMember } from "@/types";

interface AttendanceModalProps {
  eventId: string;
  members: Member[];
  existingMemberIds: string[];
  onAdded: (attendance: AttendanceWithMember) => void;
  onClose: () => void;
}

export function AttendanceModal({
  eventId,
  members,
  existingMemberIds,
  onAdded,
  onClose,
}: AttendanceModalProps) {
  const available = members.filter((m) => m.status === "ACTIVE" && !existingMemberIds.includes(m.id));
  const [memberId, setMemberId] = useState(available[0]?.id ?? "");
  const [status, setStatus] = useState("PENDING");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/attendances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, eventId, status, note: note || null }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "登録に失敗しました");
        return;
      }

      const created = await res.json();
      onAdded(created);
      onClose();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">参加メンバーを追加</h3>
        {error && <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded">{error}</div>}
        {available.length === 0 ? (
          <p className="text-sm text-gray-500 mb-4">追加できる在籍中のメンバーがいません</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メンバー</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {available.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">参加状況</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="ATTENDING">参加予定</option>
                <option value="ABSENT">欠席</option>
                <option value="PENDING">未回答</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "登録中..." : "登録"}
              </button>
            </div>
          </form>
        )}
        {available.length === 0 && (
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
}
