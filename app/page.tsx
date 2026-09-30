import { AppShell } from "@/components/layout/app-shell";
import { listTasks } from "@/features/tasks/task-data";
import { DATE_LOCALE } from "@/features/tasks/task-utils";
import { TasksOverview } from "@/features/tasks/tasks-overview";

/**
 * Rendered per request so "today" is always the real today: the dashboard
 * groups, labels and colours every task relative to the moment it is opened.
 */
export const dynamic = "force-dynamic";

export default async function Home() {
  const now = new Date();
  const tasks = await listTasks(now);

  const dateLabel = new Intl.DateTimeFormat(DATE_LOCALE, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">{dateLabel}</p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {getGreeting(now)}.
          </h1>

          <p className="max-w-2xl text-muted-foreground">
            Keep your important tasks in one place and focus on what matters
            next.
          </p>
        </div>

        <TasksOverview tasks={tasks} now={now} />
      </div>
    </AppShell>
  );
} 

function getGreeting(now: Date): string {
  const hour = now.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}
