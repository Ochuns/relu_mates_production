"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AttendanceRow } from "@/components/events/AttendanceRow";
import { AttendanceModal } from "@/components/events/AttendanceModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { EVENT_STATUS_LABELS } from "@/types";
import type { Event, Member, AttendanceWithMember, EventStatus } from "@/types";

interface EventWithCount extends Event {
  _count: { attendances: number };
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventWithCount | null>(null);
  const [attendances, setAttendances] = useState<AttendanceWithMember[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${id}`).then((r) => r.json()),
      fetch(`/api/attendances?eventId=${id}`).then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
    ])
      .then(([ev, att, mem]) => {
        setEvent(ev);
        setAttendances(att);
        setMembers(mem);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-gray-500 py-8 text-center">読み込み中...</p>;
  if (!event) return <p className="text-sm text-gray-500 py-8 text-center">イベントが見つかりません</p>;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/events" className="text-xs text-blue-600 hover:underline mb-2 inline-block">
            ← イベント一覧
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
        </div>
        <Link
          href={`/events/${id}/edit`}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          編集
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 space-y-3 text-sm">
        <div className="flex gap-2">
          <span className="text-gray-500 w-20 shrink-0">日時</span>
          <span className="text-gray-900">
            {formatDate(event.startAt)}
            {event.endAt && ` 〜 ${formatDate(event.endAt)}`}
          </span>
        </div>
        {event.location && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-20 shrink-0">場所</span>
            <span className="text-gray-900">{event.location}</span>
          </div>
        )}
        <div className="flex gap-2">
          <span className="text-gray-500 w-20 shrink-0">ステータス</span>
          <span className="text-gray-900">
            {EVENT_STATUS_LABELS[event.status as EventStatus]}
          </span>
        </div>
        {event.description && (
          <div className="flex gap-2">
            <span className="text-gray-500 w-20 shrink-0">説明</span>
            <span className="text-gray-900 whitespace-pre-wrap">{event.description}</span>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            参加記録 ({attendances.length}名)
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            + 参加メンバーを追加
          </button>
        </div>

        {attendances.length === 0 ? (
          <EmptyState message="参加記録がありません" />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">メンバー</th>
                  <th className="px-4 py-3">参加状況</th>
                  <th className="px-4 py-3">備考</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendances.map((a) => (
                  <AttendanceRow
                    key={a.id}
                    attendance={a}
                    onDeleted={(deletedId) =>
                      setAttendances((prev) => prev.filter((x) => x.id !== deletedId))
                    }
                    onUpdated={(updated) =>
                      setAttendances((prev) =>
                        prev.map((x) => (x.id === updated.id ? updated : x))
                      )
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AttendanceModal
          eventId={id}
          members={members}
          existingMemberIds={attendances.map((a) => a.memberId)}
          onAdded={(att) => setAttendances((prev) => [...prev, att])}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
