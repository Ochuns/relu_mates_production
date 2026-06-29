import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MemberStatus } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as MemberStatus | null;

    const members = await prisma.member.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(members);
  } catch {
    return NextResponse.json({ error: "メンバーの取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, role, status, notes } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "氏名は必須です" }, { status: 400 });
    }
    if (!email && !phone) {
      return NextResponse.json({ error: "メールアドレスまたは電話番号のどちらかは必須です" }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });
    }

    const member = await prisma.member.create({
      data: {
        name: name.trim(),
        email: email || null,
        phone: phone || null,
        role: role || "一般会員",
        status: status || "ACTIVE",
        notes: notes || null,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch {
    return NextResponse.json({ error: "メンバーの作成に失敗しました" }, { status: 500 });
  }
}
