"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MemberRow } from "@/components/members/MemberRow";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Member, MemberStatus } from "@/types";

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<MemberStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = filter === "ALL" ? "/api/members" : `/api/members?status=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => setMembers(data))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleDeleted = (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">メンバー一覧</h1>
        <Link
          href="/members/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + 新規メンバー追加
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        {(["ALL", "ACTIVE", "INACTIVE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 text-xs rounded-full font-medium ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "ALL" ? "全員" : s === "ACTIVE" ? "在籍中" : "退会済み"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">読み込み中...</p>
      ) : members.length === 0 ? (
        <EmptyState
          message="メンバーが登録されていません"
          actionLabel="最初のメンバーを追加"
          actionHref="/members/new"
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">氏名</th>
                <th className="px-4 py-3">役割</th>
                <th className="px-4 py-3">連絡先</th>
                <th className="px-4 py-3">在籍状態</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <MemberRow key={m.id} member={m} onDeleted={handleDeleted} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
