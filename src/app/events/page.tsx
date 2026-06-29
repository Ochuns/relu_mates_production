"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventRow } from "@/components/events/EventRow";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Event, EventStatus } from "@/types";

interface EventWithCount extends Event {
  _count: { attendances: number };
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithCount[]>([]);
  const [statusFilter, setStatusFilter] = useState<EventStatus | "ALL">("ALL");
  const [periodFilter, setPeriodFilter] = useState<"ALL" | "upcoming" | "past">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (periodFilter !== "ALL") params.set("period", periodFilter);
    const url = `/api/events${params.toString() ? "?" + params.toString() : ""}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => setEvents(data))
      .finally(() => setLoading(false));
  }, [statusFilter, periodFilter]);

  const handleDeleted = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">イベント一覧</h1>
        <Link
          href="/events/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + 新規イベント作成
        </Link>
      </div>

      <div className="mb-4 flex gap-4">
        <div className="flex gap-2">
          {(["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "ALL" ? "全て" : s === "SCHEDULED" ? "予定" : s === "COMPLETED" ? "終了" : "中止"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["ALL", "upcoming", "past"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodFilter(p)}
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                periodFilter === p
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p === "ALL" ? "全期間" : p === "upcoming" ? "今後" : "過去"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">読み込み中...</p>
      ) : events.length === 0 ? (
        <EmptyState
          message="イベントが登録されていません"
          actionLabel="最初のイベントを作成"
          actionHref="/events/new"
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">イベント名</th>
                <th className="px-4 py-3">開催日時</th>
                <th className="px-4 py-3">場所</th>
                <th className="px-4 py-3">ステータス</th>
                <th className="px-4 py-3 text-center">参加者数</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((e) => (
                <EventRow key={e.id} event={e} onDeleted={handleDeleted} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
