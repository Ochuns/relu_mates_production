const REPO = 'ReLU-Mates-Study/study-progress'

interface GitHubIssue {
  state: 'open' | 'closed'
  title: string
  labels: { name: string }[]
  closed_at: string | null
}

export interface CourseProgress {
  name: string
  area: string
  totalLessons: number
  completedLessons: number
}

export interface MemberProgress {
  memberId: string
  memberName: string
  totalLessons: number
  completedLessons: number
  progressPct: number
  rank: number
  courses: CourseProgress[]
}

export interface ProgressData {
  lastFetched: string
  members: MemberProgress[]
  totalLessons: number
  totalCompleted: number
}

async function fetchIssuePage(page: number): Promise<GitHubIssue[]> {
  const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const url =
    `https://api.github.com/repos/${REPO}/issues` +
    `?labels=type%3Alesson&state=all&per_page=100&page=${page}`

  const res = await fetch(url, {
    headers,
    next: { revalidate: 300 },
  })

  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function fetchProgressData(): Promise<ProgressData> {
  const allIssues: GitHubIssue[] = []
  let page = 1
  while (true) {
    const issues = await fetchIssuePage(page)
    allIssues.push(...issues)
    if (issues.length < 100) break
    page++
  }

  const memberMap = new Map<string, GitHubIssue[]>()
  for (const issue of allIssues) {
    const memberLabel = issue.labels.find((l) => l.name.startsWith('member:'))
    if (!memberLabel) continue
    const memberId = memberLabel.name.slice(7)
    if (!memberMap.has(memberId)) memberMap.set(memberId, [])
    memberMap.get(memberId)!.push(issue)
  }

  const members: MemberProgress[] = []

  for (const [memberId, issues] of Array.from(memberMap.entries())) {
    const courseMap = new Map<string, GitHubIssue[]>()
    for (const issue of issues) {
      const parts = issue.title.split(' / ')
      const courseName = parts.slice(0, 2).join(' / ')
      if (!courseMap.has(courseName)) courseMap.set(courseName, [])
      courseMap.get(courseName)!.push(issue)
    }

    const courses: CourseProgress[] = []
    for (const [name, courseIssues] of Array.from(courseMap.entries())) {
      const areaLabel = courseIssues[0]?.labels.find((l: { name: string }) => l.name.startsWith('area:'))
      courses.push({
        name,
        area: areaLabel?.name.slice(5) ?? 'progate',
        totalLessons: courseIssues.length,
        completedLessons: courseIssues.filter((i: GitHubIssue) => i.state === 'closed').length,
      })
    }
    courses.sort((a, b) => a.name.localeCompare(b.name, 'ja'))

    const total = issues.length
    const completed = issues.filter((i: GitHubIssue) => i.state === 'closed').length

    members.push({
      memberId,
      memberName: `${memberId}さん`,
      totalLessons: total,
      completedLessons: completed,
      progressPct: total > 0 ? Math.round((completed / total) * 100) : 0,
      rank: 0,
      courses,
    })
  }

  members.sort(
    (a, b) => b.completedLessons - a.completedLessons || b.progressPct - a.progressPct || a.memberId.localeCompare(b.memberId),
  )
  members.forEach((m, i) => {
    m.rank = i + 1
  })

  const totalLessons = members.reduce((s, m) => s + m.totalLessons, 0)
  const totalCompleted = members.reduce((s, m) => s + m.completedLessons, 0)

  return {
    lastFetched: new Date().toISOString(),
    members,
    totalLessons,
    totalCompleted,
  }
}
