import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const member = await prisma.member.findUnique({ where: { id: params.id } });
    if (!member) return NextResponse.json({ error: "メンバーが見つかりません" }, { status: 404 });
    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: "メンバーの取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        email: email || null,
        phone: phone || null,
        role: role || "一般会員",
        status: status || "ACTIVE",
        notes: notes || null,
      },
    });

    return NextResponse.json(member);
  } catch {
    return NextResponse.json({ error: "メンバーの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.member.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "メンバーの削除に失敗しました" }, { status: 500 });
  }
}
