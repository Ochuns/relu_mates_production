import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { _count: { select: { attendances: true } } },
    });
    if (!event) return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "イベントの取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { title, startAt, endAt, location, description, status } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "イベント名は必須です" }, { status: 400 });
    }
    if (!startAt) {
      return NextResponse.json({ error: "開催日時は必須です" }, { status: 400 });
    }
    if (endAt && new Date(endAt) <= new Date(startAt)) {
      return NextResponse.json({ error: "終了日時は開始日時より後にしてください" }, { status: 400 });
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        location: location || null,
        description: description || null,
        status: status || "SCHEDULED",
      },
    });

    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: "イベントの更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.event.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "イベントの削除に失敗しました" }, { status: 500 });
  }
}
