# Research: 団体メンバー・イベント管理ツール

**Phase**: 0 — Outline & Research
**Date**: 2026-05-27
**Feature**: specs/001-member-event-mgmt/spec.md

---

## 技術スタック選定

### Decision: Next.js 14 (App Router) + TypeScript + SQLite (Prisma ORM) + Tailwind CSS

**Rationale**:
- **Next.js (App Router)**: フロントエンドとAPIを一つのプロジェクトで管理できるフルスタックフレームワーク。CRUDアプリケーションの構築に最適
- **TypeScript**: プロジェクトパス `/TS/` の通り、TypeScriptを前提とした環境
- **SQLite (Prisma)**: ファイルベースのデータベース。サーバー不要で単一ユーザー向けツールに最適。Prismaにより型安全なデータアクセスが可能
- **Tailwind CSS**: 素早いUI構築が可能。複雑なデザインシステム不要の「簡易的なツール」に適合

**Alternatives considered**:
- React + Vite + localStorage: データ永続化が不安定（ブラウザキャッシュ依存）、100件以上のデータ管理に不向き
- React + Vite + 外部DB (PostgreSQL/MySQL): インフラ構築が必要、単一ユーザーには過剰
- Electron Desktop App: 配布・アップデート管理が複雑、ブラウザで十分
- Python/Django, Ruby on Rails: TypeScript環境と不整合

---

## データ永続化戦略

### Decision: SQLite ファイルベースストレージ

**Rationale**:
- 認証なし・シングルユーザーのツールにはファイルベースDBが最もシンプル
- インストール・起動が容易（`npm run dev` のみ）
- Prismaマイグレーション機能でスキーマ変更が管理しやすい
- 数百名のメンバー・数百件のイベントを扱うスケールに十分

**Alternatives considered**:
- IndexedDB / localStorage: APIが複雑、リレーショナルデータの管理に不向き
- PostgreSQL: サーバー起動が必要、単一ユーザーには過剰
- JSON ファイル: 並行書き込みの安全性がなく、成長するデータに不適

---

## テスト戦略

### Decision: Vitest (ユニット・統合) + Playwright (E2E)

**Rationale**:
- Vitest: Next.js / React との相性が良く、高速
- Playwright: ブラウザ操作のE2Eテストに最適。主要ユーザーストーリーの受け入れシナリオをカバー

**Alternatives considered**:
- Jest: Vitest に比べ設定が煩雑、ESM対応に課題
- Cypress: Playwright より重い、E2E以外の用途に不向き

---

## UIアーキテクチャ

### Decision: シングルページアプリ (SPA) スタイル with サーバーコンポーネント

**Rationale**:
- 管理画面はナビゲーション（メンバー一覧 / イベント一覧）とCRUDフォームが中心
- Next.js App Router: サーバーコンポーネントで初期データ取得、クライアントコンポーネントでフォーム操作

**Page structure**:
- `/` → ダッシュボード（サマリー表示）
- `/members` → メンバー一覧
- `/members/new` → メンバー新規作成
- `/members/[id]/edit` → メンバー編集
- `/events` → イベント一覧
- `/events/new` → イベント新規作成
- `/events/[id]` → イベント詳細（参加記録）
- `/events/[id]/edit` → イベント編集

---

## セキュリティ考慮

認証なしのシングルユーザーツールのため、認証・認可は対象外。
ローカルホスト（`localhost`）での動作を前提とし、インターネット公開は想定しない。
SQLインジェクション対策: Prisma ORM が自動的に処理。

---

## 解決済みの NEEDS CLARIFICATION

| 項目 | 決定内容 | 根拠 |
|------|----------|------|
| 言語/フレームワーク | TypeScript + Next.js 14 | TS環境、フルスタック一体型 |
| データ永続化 | SQLite via Prisma | シングルユーザー、セットアップ簡便 |
| テスト | Vitest + Playwright | Next.js相性、高速 |
| デプロイ | ローカル実行（`npm run dev`） | 単一ユーザー、シンプル優先 |
