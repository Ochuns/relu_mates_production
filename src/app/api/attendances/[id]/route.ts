import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status, note } = body;

    const attendance = await prisma.attendance.update({
      where: { id: params.id },
      data: { status: status || "PENDING", note: note || null },
      include: { member: true },
    });

    return NextResponse.json(attendance);
  } catch {
    return NextResponse.json({ error: "参加記録の更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.attendance.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "参加記録の削除に失敗しました" }, { status: 500 });
  }
}
