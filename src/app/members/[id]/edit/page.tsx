import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MemberForm } from "@/components/members/MemberForm";
import type { Member } from "@/types";

export default async function EditMemberPage({ params }: { params: { id: string } }) {
  const raw = await prisma.member.findUnique({ where: { id: params.id } });
  if (!raw) notFound();

  const member: Member = {
    ...raw,
    status: raw.status as Member["status"],
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">メンバー編集</h1>
      <MemberForm member={member} />
    </div>
  );
}
