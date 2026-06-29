"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Member } from "@/types";

interface MemberFormProps {
  member?: Member;
}

export function MemberForm({ member }: MemberFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = (data: FormData) => {
    const errors: Record<string, string> = {};
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const phone = data.get("phone") as string;

    if (!name || name.trim() === "") errors.name = "氏名は必須です";
    if (!email && !phone) errors.contact = "メールアドレスまたは電話番号のどちらかを入力してください";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "メールアドレスの形式が正しくありません";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const errors = validate(formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email") || null,
      phone: formData.get("phone") || null,
      role: formData.get("role"),
      status: formData.get("status"),
      notes: formData.get("notes") || null,
    };

    try {
      const res = await fetch(member ? `/api/members/${member.id}` : "/api/members", {
        method: member ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "保存に失敗しました");
        return;
      }

      router.push("/members");
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
          氏名 <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          defaultValue={member?.name}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
        <input
          name="email"
          type="email"
          defaultValue={member?.email ?? ""}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
        <input
          name="phone"
          defaultValue={member?.phone ?? ""}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.contact && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.contact}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">役割</label>
        <input
          name="role"
          defaultValue={member?.role ?? "一般会員"}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">在籍状態</label>
        <select
          name="status"
          defaultValue={member?.status ?? "ACTIVE"}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ACTIVE">在籍中</option>
          <option value="INACTIVE">退会済み</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
        <textarea
          name="notes"
          defaultValue={member?.notes ?? ""}
          rows={3}
          maxLength={500}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          onClick={() => router.push("/members")}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
