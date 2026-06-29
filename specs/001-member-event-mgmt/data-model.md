# Data Model: 団体メンバー・イベント管理ツール

**Phase**: 1 — Design
**Date**: 2026-05-27
**Feature**: specs/001-member-event-mgmt/spec.md

---

## エンティティ一覧

### Member（メンバー）

団体に所属する個人を表す。

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | UUID | ✓ | 一意識別子（自動生成） |
| name | string | ✓ | 氏名（最大100文字） |
| email | string | - | メールアドレス（任意、形式バリデーション） |
| phone | string | - | 電話番号（任意） |
| role | string | ✓ | 役割（例: 役員 / 一般会員）デフォルト: 一般会員 |
| status | enum | ✓ | 在籍状態: `ACTIVE`（在籍中）/ `INACTIVE`（退会済み） |
| notes | string | - | 備考（任意、最大500文字） |
| createdAt | datetime | ✓ | 登録日時（自動） |
| updatedAt | datetime | ✓ | 更新日時（自動） |

**バリデーションルール**:
- `name` は空文字不可
- `email` と `phone` のどちらか一方は入力必須（両方空は不可）
- `email` が入力された場合、有効なメールアドレス形式であること
- 同一 `name` + `email` の組み合わせは重複登録不可（警告表示）

**状態遷移**:
```
ACTIVE → INACTIVE（退会処理）
INACTIVE → ACTIVE（復会処理）
```

---

### Event（イベント）

団体が開催する集まりや行事を表す。

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | UUID | ✓ | 一意識別子（自動生成） |
| title | string | ✓ | イベント名（最大200文字） |
| startAt | datetime | ✓ | 開催日時 |
| endAt | datetime | - | 終了日時（任意） |
| location | string | - | 開催場所（任意、最大200文字） |
| description | string | - | 説明・備考（任意、最大2000文字） |
| status | enum | ✓ | ステータス: `SCHEDULED`（予定）/ `COMPLETED`（終了）/ `CANCELLED`（中止） |
| createdAt | datetime | ✓ | 作成日時（自動） |
| updatedAt | datetime | ✓ | 更新日時（自動） |

**バリデーションルール**:
- `title` は空文字不可
- `startAt` は有効な日時形式であること
- `endAt` が設定された場合、`startAt` より後であること
- 過去日付の `startAt` は作成時に警告表示（禁止ではない）

**状態遷移**:
```
SCHEDULED → COMPLETED（終了処理）
SCHEDULED → CANCELLED（中止処理）
CANCELLED → SCHEDULED（再開処理）
```

---

### Attendance（参加記録）

特定のイベントに対する特定メンバーの参加状況を表す。Member と Event を紐付ける中間エンティティ。

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | UUID | ✓ | 一意識別子（自動生成） |
| memberId | UUID | ✓ | 参照: Member.id |
| eventId | UUID | ✓ | 参照: Event.id |
| status | enum | ✓ | 参加状況: `ATTENDING`（参加予定）/ `ABSENT`（欠席）/ `PENDING`（未回答）|
| note | string | - | 備考（任意、最大500文字） |
| createdAt | datetime | ✓ | 登録日時（自動） |
| updatedAt | datetime | ✓ | 更新日時（自動） |

**バリデーションルール**:
- `(memberId, eventId)` の組み合わせは一意（同一メンバーの同一イベントへの重複登録不可）
- 参照先の Member と Event が存在すること（外部キー制約）

---

## エンティティ関係図

```
Member (1) ────── (N) Attendance (N) ────── (1) Event
```

- 1人のメンバーは複数のイベントに参加記録を持てる
- 1つのイベントは複数のメンバーの参加記録を持てる
- 参加記録はメンバーまたはイベントが削除された場合、連動して削除される（CASCADE DELETE）

---

## 削除ルール

| 操作 | 挙動 |
|------|------|
| Member 削除 | 関連する Attendance をすべて削除 |
| Event 削除 | 関連する Attendance をすべて削除 |
| Attendance 削除 | 単独削除可能（Member・Event に影響なし） |

---

## インデックス方針

- `Member.status`：在籍中メンバーのフィルタリングに使用
- `Event.startAt`：日時順ソートに使用
- `Attendance.(memberId, eventId)`：複合ユニークインデックス
