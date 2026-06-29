import { MemberForm } from "@/components/members/MemberForm";

export default function NewMemberPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">新規メンバー追加</h1>
      <MemberForm />
    </div>
  );
}
