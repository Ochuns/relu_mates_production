import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "メンバー・イベント管理",
  description: "団体のメンバーとイベントを管理するツール",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen bg-gray-50">
        <nav className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col p-4 gap-1">
          <div className="text-base font-bold text-gray-800 mb-4 px-2">団体管理ツール</div>
          <NavLink href="/">ダッシュボード</NavLink>
          <NavLink href="/members">メンバー</NavLink>
          <NavLink href="/events">イベント</NavLink>
        </nav>
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {children}
    </Link>
  );
}
