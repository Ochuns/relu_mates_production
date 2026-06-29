import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EventForm } from "@/components/events/EventForm";
import type { Event } from "@/types";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const raw = await prisma.event.findUnique({ where: { id: params.id } });
  if (!raw) notFound();

  const event: Event = {
    ...raw,
    status: raw.status as Event["status"],
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">イベント編集</h1>
      <EventForm event={event} />
    </div>
  );
}
