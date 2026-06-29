import { EventForm } from "@/components/events/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">新規イベント作成</h1>
      <EventForm />
    </div>
  );
}
