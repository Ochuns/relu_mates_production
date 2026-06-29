---

description: "Task list for 団体メンバー・イベント管理ツール"
---

# Tasks: 団体メンバー・イベント管理ツール

**Input**: Design documents from `specs/001-member-event-mgmt/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-screens.md ✅

**Tests**: テストは明示的に要求されていないため、実装タスクのみ生成。

**Organization**: タスクはユーザーストーリー単位でグループ化され、各ストーリーを独立して実装・テスト可能。

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: 対応するユーザーストーリー（US1, US2, US3）
- 各タスクに正確なファイルパスを記載

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: Next.js プロジェクトの作成と基本設定

- [x] T001 Create Next.js 14 project with TypeScript template at repository root (`npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir`)
- [x] T002 Install additional dependencies: `prisma`, `@prisma/client`, `uuid` in package.json
- [x] T003 [P] Configure Prettier in `.prettierrc` and add format script to package.json
- [x] T004 [P] Configure path aliases in `tsconfig.json` (`@/*` → `./src/*`)
- [x] T005 Setup `.env.local` with `DATABASE_URL="file:./dev.db"`
- [x] T006 Create directory structure per plan.md: `src/components/ui/`, `src/components/members/`, `src/components/events/`, `src/lib/`, `src/types/`

**Checkpoint**: プロジェクトが `npm run dev` で起動すること

---

## Phase 2: Foundational（共通基盤）

**Purpose**: 全ユーザーストーリーが依存するコア基盤。このフェーズ完了前にユーザーストーリー実装不可

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Define Prisma schema with Member, Event, Attendance models in `prisma/schema.prisma` (per data-model.md)
- [x] T008 Run initial database migration: `npx prisma migrate dev --name init`
- [x] T009 Create Prisma client singleton in `src/lib/prisma.ts`
- [x] T010 [P] Create shared TypeScript types in `src/types/index.ts` (Member, Event, Attendance, their status enums)
- [x] T011 Create application layout with sidebar navigation in `src/app/layout.tsx` (links: Dashboard, Members, Events)
- [x] T012 [P] Create `ConfirmDialog` component in `src/components/ui/ConfirmDialog.tsx` (title, message, onConfirm, onCancel props)
- [x] T013 [P] Create `Toast` notification component in `src/components/ui/Toast.tsx` (success/error variants)
- [x] T014 [P] Create `EmptyState` component in `src/components/ui/EmptyState.tsx` (icon, message, action button props)
- [x] T015 [P] Create `LoadingSpinner` component in `src/components/ui/LoadingSpinner.tsx`

**Checkpoint**: 基盤完成 — DBマイグレーション済み、共通コンポーネント利用可能、ナビゲーション表示

---

## Phase 3: User Story 1 - メンバー登録・管理 (Priority: P1) 🎯 MVP

**Goal**: メンバーを登録・編集・削除し、一覧で確認できる

**Independent Test**: `npm run dev` 起動後、メンバーを新規作成 → 一覧に表示 → 編集 → 削除 の一連操作が完了すること

### Implementation

- [x] T016 [P] [US1] Implement `GET /api/members` (filter by status) and `POST /api/members` (create with validation) in `src/app/api/members/route.ts`
- [x] T017 [P] [US1] Implement `GET /api/members/[id]`, `PUT /api/members/[id]`, `DELETE /api/members/[id]` in `src/app/api/members/[id]/route.ts`
- [x] T018 [P] [US1] Create `MemberRow` table row component in `src/components/members/MemberRow.tsx` (name, role, contact, status, edit/delete buttons)
- [x] T019 [US1] Create `MemberForm` component in `src/components/members/MemberForm.tsx` (fields: name, email, phone, role, status, notes; inline validation per contracts/ui-screens.md)
- [x] T020 [US1] Create members list page in `src/app/members/page.tsx` (fetches members, status filter, empty state, add button; uses T016, T018)
- [x] T021 [US1] Create new member page in `src/app/members/new/page.tsx` (uses T019, redirects to `/members` on save)
- [x] T022 [US1] Create member edit page in `src/app/members/[id]/edit/page.tsx` (fetches member by id, uses T017, T019, redirects to `/members` on save)

**Checkpoint**: メンバーのCRUD操作がすべて動作し、一覧への即時反映を確認できる

---

## Phase 4: User Story 2 - イベント登録・管理 (Priority: P2)

**Goal**: イベントを作成・編集・削除し、日時順一覧で確認できる

**Independent Test**: `npm run dev` 起動後、イベントを新規作成 → 一覧に日時順で表示 → 編集 → 削除 の一連操作が完了すること

### Implementation

- [x] T023 [P] [US2] Implement `GET /api/events` (filter by status, sorted by startAt) and `POST /api/events` (create with validation) in `src/app/api/events/route.ts`
- [x] T024 [P] [US2] Implement `GET /api/events/[id]`, `PUT /api/events/[id]`, `DELETE /api/events/[id]` in `src/app/api/events/[id]/route.ts`
- [x] T025 [P] [US2] Create `EventRow` table row component in `src/components/events/EventRow.tsx` (title, startAt, location, status, attendance count, edit/delete buttons)
- [x] T026 [US2] Create `EventForm` component in `src/components/events/EventForm.tsx` (fields: title, startAt, endAt, location, description, status; endAt > startAt validation; past date warning)
- [x] T027 [US2] Create events list page in `src/app/events/page.tsx` (fetches events sorted by startAt, status/period filter, empty state, add button; uses T023, T025)
- [x] T028 [US2] Create new event page in `src/app/events/new/page.tsx` (uses T026, redirects to `/events` on save)
- [x] T029 [US2] Create event edit page in `src/app/events/[id]/edit/page.tsx` (fetches event by id, uses T024, T026, redirects to `/events` on save)

**Checkpoint**: イベントのCRUD操作がすべて動作し、日時順ソートと一覧への即時反映を確認できる

---

## Phase 5: User Story 3 - イベント出欠管理 (Priority: P3)

**Goal**: イベントごとにメンバーの参加状況（参加予定・欠席・未回答）を登録・確認できる

**Independent Test**: `npm run dev` 起動後、イベント詳細ページでメンバーを参加登録 → 一覧に表示 → 状態変更 → 削除 の操作が完了すること

### Implementation

- [x] T030 [P] [US3] Implement `GET /api/attendances?eventId=` and `POST /api/attendances` (with duplicate check) in `src/app/api/attendances/route.ts`
- [x] T031 [P] [US3] Implement `PUT /api/attendances/[id]` (update status/note) and `DELETE /api/attendances/[id]` in `src/app/api/attendances/[id]/route.ts`
- [x] T032 [P] [US3] Create `AttendanceRow` component in `src/components/events/AttendanceRow.tsx` (member name, status badge, note, edit/delete buttons)
- [x] T033 [US3] Create `AttendanceModal` component in `src/components/events/AttendanceModal.tsx` (member select from active members, status select, note field; uses T030)
- [x] T034 [US3] Create event detail page in `src/app/events/[id]/page.tsx` (event info, attendance list, add attendance button with T033 modal; uses T024, T030, T032)

**Checkpoint**: イベント詳細ページで参加記録の追加・変更・削除がすべて動作することを確認できる

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数ストーリーにまたがる改善・仕上げ

- [x] T035 Create dashboard page in `src/app/page.tsx` (active member count, upcoming event count within 30 days, latest 5 events list)
- [x] T036 [P] Add consistent error handling to all API routes in `src/app/api/` (validation errors → 400, not found → 404, server error → 500)
- [x] T037 [P] Add loading states to all pages using Next.js `loading.tsx` files in `src/app/members/`, `src/app/events/`
- [x] T038 Run TypeScript type check (`npm run typecheck`) and fix all type errors
- [x] T039 Validate quickstart.md instructions end-to-end in a clean environment
- [x] T040 [P] Add `db:migrate` and `db:studio` npm scripts to `package.json` per quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存なし — 即座に開始可能
- **Foundational (Phase 2)**: Phase 1 完了後 — **全ユーザーストーリーをブロック**
- **User Stories (Phase 3-5)**: Phase 2 完了後に開始可能
  - Phase 3 (US1) と Phase 4 (US2) は並列実行可能
  - Phase 5 (US3) は US1（メンバーデータ）と US2（イベントデータ）の完了を前提とする
- **Polish (Phase 6)**: 必要なユーザーストーリーが完了後

### User Story Dependencies

- **US1 (P1)**: Phase 2 完了後すぐ開始可能 — 他ストーリーへの依存なし
- **US2 (P2)**: Phase 2 完了後すぐ開始可能 — US1 と並列実行可能
- **US3 (P3)**: US1 と US2 の完了後 — Member と Event データが必要

### Within Each User Story

- API routes → コンポーネント → ページ の順で実装
- [P] タグのタスクはフェーズ内で並列実行可能

---

## Parallel Example: User Story 1 (メンバー管理)

```bash
# 同時に起動できるタスク:
Task: T016 "GET /api/members, POST /api/members in src/app/api/members/route.ts"
Task: T017 "GET/PUT/DELETE /api/members/[id] in src/app/api/members/[id]/route.ts"
Task: T018 "MemberRow component in src/components/members/MemberRow.tsx"

# T016, T017, T018 完了後、同時に起動できるタスク:
Task: T019 "MemberForm component in src/components/members/MemberForm.tsx"
Task: T020 "Members list page in src/app/members/page.tsx"

# T019 完了後:
Task: T021 "New member page in src/app/members/new/page.tsx"
Task: T022 "Member edit page in src/app/members/[id]/edit/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 のみ)

1. Phase 1: Setup 完了
2. Phase 2: Foundational 完了（**必須**、全ストーリーをブロック）
3. Phase 3: User Story 1（メンバー管理）完了
4. **STOP & VALIDATE**: メンバーのCRUD操作を独立して動作確認
5. デモ可能な状態

### Incremental Delivery

1. Setup + Foundational → 基盤準備完了
2. User Story 1 追加 → 独立テスト → デモ (MVP!)
3. User Story 2 追加 → 独立テスト → デモ
4. User Story 3 追加 → 独立テスト → デモ
5. Polish → 完成

---

## Notes

- [P] タスク = 異なるファイル、依存なし → 並列実行可能
- [Story] ラベルでタスクをユーザーストーリーに紐付け
- 各ユーザーストーリーは独立して完成・テスト可能
- 各タスクまたは論理グループ完了後にコミットを推奨
- チェックポイントで独立してストーリーを検証してから次へ進む
