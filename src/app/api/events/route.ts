import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const period = searchParams.get("period");
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(period === "upcoming" ? { startAt: { gte: now } } : {}),
        ...(period === "past" ? { startAt: { lt: now } } : {}),
      },
      orderBy: { startAt: "asc" },
      include: { _count: { select: { attendances: true } } },
    });

    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "イベントの取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        location: location || null,
        description: description || null,
        status: status || "SCHEDULED",
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: "イベントの作成に失敗しました" }, { status: 500 });
  }
}
