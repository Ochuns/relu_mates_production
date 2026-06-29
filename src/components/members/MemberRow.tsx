"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MEMBER_STATUS_LABELS } from "@/types";
import type { Member } from "@/types";
import Link from "next/link";

interface MemberRowProps {
  member: Member;
  onDeleted: (id: string) => void;
}

export function MemberRow({ member, onDeleted }: MemberRowProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    await fetch(`/api/members/${member.id}`, { method: "DELETE" });
    onDeleted(member.id);
    setShowConfirm(false);
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{member.role}</td>
        <td className="px-4 py-3 text-sm text-gray-600">{member.email || member.phone || "—"}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
              member.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {MEMBER_STATUS_LABELS[member.status]}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-right space-x-2">
          <Link
            href={`/members/${member.id}/edit`}
            className="text-blue-600 hover:underline text-xs"
          >
            編集
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="text-red-600 hover:underline text-xs"
          >
            削除
          </button>
        </td>
      </tr>
      {showConfirm && (
        <ConfirmDialog
          title="メンバーを削除"
          message={`「${member.name}」を削除します。関連する出欠記録も削除されます。`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
