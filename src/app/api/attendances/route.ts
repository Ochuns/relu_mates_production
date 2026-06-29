import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const attendances = await prisma.attendance.findMany({
      where: eventId ? { eventId } : undefined,
      include: { member: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(attendances);
  } catch {
    return NextResponse.json({ error: "参加記録の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, eventId, status, note } = body;

    if (!memberId) return NextResponse.json({ error: "メンバーは必須です" }, { status: 400 });
    if (!eventId) return NextResponse.json({ error: "イベントは必須です" }, { status: 400 });

    const existing = await prisma.attendance.findUnique({
      where: { memberId_eventId: { memberId, eventId } },
    });
    if (existing) {
      return NextResponse.json({ error: "このメンバーはすでに参加登録されています" }, { status: 409 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        memberId,
        eventId,
        status: status || "PENDING",
        note: note || null,
      },
      include: { member: true },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch {
    return NextResponse.json({ error: "参加記録の作成に失敗しました" }, { status: 500 });
  }
}
