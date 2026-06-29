import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [activeMembers, upcomingCount, upcomingEvents] = await Promise.all([
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.event.count({
      where: { status: "SCHEDULED", startAt: { gte: now, lte: thirtyDaysLater } },
    }),
    prisma.event.findMany({
      where: { status: "SCHEDULED", startAt: { gte: now } },
      orderBy: { startAt: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">在籍中メンバー</div>
          <div className="text-3xl font-bold text-gray-900">{activeMembers}<span className="text-base font-normal text-gray-500 ml-1">名</span></div>
          <Link href="/members" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
            メンバー管理 →
          </Link>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">今後30日のイベント</div>
          <div className="text-3xl font-bold text-gray-900">{upcomingCount}<span className="text-base font-normal text-gray-500 ml-1">件</span></div>
          <Link href="/events" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
            イベント管理 →
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">直近の予定イベント</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-500">予定されているイベントはありません</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {upcomingEvents.map((ev) => (
              <Link
                key={ev.id}
                href={`/events/${ev.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900">{ev.title}</span>
                <span className="text-xs text-gray-500">
                  {new Date(ev.startAt).toLocaleDateString("ja-JP")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
