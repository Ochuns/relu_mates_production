import { fetchProgressData, MemberProgress, CourseProgress } from '@/lib/github-progress'

export const revalidate = 300

const MEDALS = ['🥇', '🥈', '🥉']

function progressColor(pct: number): string {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 30) return 'bg-amber-400'
  return 'bg-rose-400'
}

function ProgressBar({ pct, thin }: { pct: number; thin?: boolean }) {
  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${thin ? 'h-1.5' : 'h-3'}`}>
      <div
        className={`h-full rounded-full transition-all ${progressColor(pct)}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return <span className="text-xl">{MEDALS[rank - 1]}</span>
  }
  return (
    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-sm font-bold">
      {rank}
    </span>
  )
}

function CourseBreakdown({ courses }: { courses: CourseProgress[] }) {
  const progate = courses.filter((c) => c.area === 'progate')
  const practice = courses.filter((c) => c.area === 'practice')

  const section = (title: string, items: CourseProgress[]) =>
    items.length > 0 && (
      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{title}</div>
        <div className="space-y-1">
          {items.map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-48 truncate">{c.name.split(' / ')[1]}</span>
              <div className="flex-1">
                <ProgressBar pct={c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0} thin />
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">
                {c.completedLessons}/{c.totalLessons}
              </span>
            </div>
          ))}
        </div>
      </div>
    )

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {section('Progate', progate)}
      {section('実践課題', practice)}
    </div>
  )
}

function MemberCard({ member, showDetail }: { member: MemberProgress; showDetail?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3 mb-2">
        <RankBadge rank={member.rank} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-800">{member.memberName}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {member.completedLessons}/{member.totalLessons} レッスン
              </span>
              <span className={`text-sm font-bold ${member.progressPct >= 70 ? 'text-emerald-600' : member.progressPct >= 30 ? 'text-amber-500' : 'text-rose-500'}`}>
                {member.progressPct}%
              </span>
            </div>
          </div>
          <ProgressBar pct={member.progressPct} />
        </div>
      </div>
      {showDetail && <CourseBreakdown courses={member.courses} />}
    </div>
  )
}

export default async function ProgressPage() {
  let data
  let error: string | null = null

  try {
    data = await fetchProgressData()
  } catch (e) {
    error = e instanceof Error ? e.message : 'データの取得に失敗しました'
  }

  if (error || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">学習進捗ダッシュボード</h1>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-700">
          <p className="font-semibold">データの取得に失敗しました</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-2 text-rose-500">
            GITHUB_TOKEN を .env に設定するとレート制限を回避できます。
          </p>
        </div>
      </div>
    )
  }

  const { members, totalLessons, totalCompleted, lastFetched } = data
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0
  const top3 = members.slice(0, 3)
  const rest = members.slice(3)

  const lastFetchedStr = new Date(lastFetched).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">学習進捗ダッシュボード</h1>
        <span className="text-xs text-gray-400">最終更新: {lastFetchedStr}（5分キャッシュ）</span>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">参加メンバー</div>
          <div className="text-3xl font-bold text-gray-900">{members.length}<span className="text-base font-normal text-gray-500 ml-1">名</span></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-1">完了レッスン合計</div>
          <div className="text-3xl font-bold text-gray-900">{totalCompleted}<span className="text-base font-normal text-gray-500 ml-1">/ {totalLessons}</span></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-2">全体進捗</div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar pct={overallPct} />
            </div>
            <span className="text-xl font-bold text-gray-700">{overallPct}%</span>
          </div>
        </div>
      </div>

      {/* トップ3 */}
      {top3.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3">🏆 トップランキング</h2>
          <div className="grid grid-cols-3 gap-4">
            {top3.map((m) => (
              <MemberCard key={m.memberId} member={m} showDetail />
            ))}
          </div>
        </div>
      )}

      {/* 全メンバーランキング */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">全メンバー進捗</h2>
        {members.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            進捗データがまだありません
          </div>
        ) : (
          <div className="space-y-3">
            {/* top3はすでに上に表示しているので4位以降 */}
            {rest.map((m) => (
              <MemberCard key={m.memberId} member={m} showDetail />
            ))}
            {rest.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-2">4位以降のメンバーはいません</p>
            )}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-4">
          ※ GitHub Issues のレッスンIssueが閉じられると進捗に反映されます（
          <a href={`https://github.com/${data ? 'ReLU-Mates-Study/study-progress' : ''}`} className="underline" target="_blank" rel="noreferrer">
            ReLU-Mates-Study/study-progress
          </a>
          ）
        </p>
      </div>
    </div>
  )
}
