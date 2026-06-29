"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Event } from "@/types";

interface EventFormProps {
  event?: Event;
}

function toDatetimeLocal(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pastWarning, setPastWarning] = useState(false);

  const handleStartAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && new Date(e.target.value) < new Date()) {
      setPastWarning(true);
    } else {
      setPastWarning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const errors: Record<string, string> = {};
    const title = formData.get("title") as string;
    const startAt = formData.get("startAt") as string;
    const endAt = formData.get("endAt") as string;

    if (!title || title.trim() === "") errors.title = "イベント名は必須です";
    if (!startAt) errors.startAt = "開催日時は必須です";
    if (endAt && startAt && new Date(endAt) <= new Date(startAt)) {
      errors.endAt = "終了日時は開始日時より後にしてください";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      startAt,
      endAt: endAt || null,
      location: formData.get("location") || null,
      description: formData.get("description") || null,
      status: formData.get("status"),
    };

    try {
      const res = await fetch(event ? `/api/events/${event.id}` : "/api/events", {
        method: event ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "保存に失敗しました");
        return;
      }

      router.push("/events");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          イベント名 <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          defaultValue={event?.title}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          開催日時 <span className="text-red-500">*</span>
        </label>
        <input
          name="startAt"
          type="datetime-local"
          defaultValue={toDatetimeLocal(event?.startAt)}
          onChange={handleStartAtChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {pastWarning && (
          <p className="mt-1 text-xs text-yellow-600">⚠ 過去の日時が選択されています</p>
        )}
        {fieldErrors.startAt && <p className="mt-1 text-xs text-red-600">{fieldErrors.startAt}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">終了日時</label>
        <input
          name="endAt"
          type="datetime-local"
          defaultValue={toDatetimeLocal(event?.endAt)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.endAt && <p className="mt-1 text-xs text-red-600">{fieldErrors.endAt}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
        <input
          name="location"
          defaultValue={event?.location ?? ""}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
        <textarea
          name="description"
          defaultValue={event?.description ?? ""}
          rows={4}
          maxLength={2000}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
        <select
          name="status"
          defaultValue={event?.status ?? "SCHEDULED"}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="SCHEDULED">予定</option>
          <option value="COMPLETED">終了</option>
          <option value="CANCELLED">中止</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
