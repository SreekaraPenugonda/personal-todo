"use client";

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";

import { TaskList } from "./task-list";
import type { Task } from "./task.types";
import { isTaskExpiring } from "./task-utils";

interface TasksOverviewProps {
  tasks: Task[];
  /** Reference instant supplied by the server so grouping is deterministic. */
  now: Date;
}

/**
 * The dashboard's task surface: the stat row, Today's Tasks and Upcoming.
 *
 * Owns the interactive state for the whole page so the stat cards and the lists
 * can never disagree with each other.
 */
export function TasksOverview({ tasks: initialTasks, now }: TasksOverviewProps) {
  const { groups, setTaskCompleted, deleteTask } = useTasks(initialTasks, now);

  const expiringCount = [...groups.today, ...groups.upcoming].filter((task) =>
    isTaskExpiring(task, now),
  ).length;

  const todayTotal =
    groups.overdue.length + groups.today.length + groups.completed.length;
  const remainingToday = groups.overdue.length + groups.today.length;

  function handleOpenTask(taskId: string) {
    // TODO(step 3): open the Task Details / Edit dialog for this task.
    console.info("[tasks] open details requested for", taskId);
  }

  const stats = [
    {
      label: "Today",
      value: groups.today.length,
      description: "Tasks due today",
    },
    {
      label: "Upcoming",
      value: groups.upcoming.length,
      description: "Tasks coming up",
    },
    {
      label: "Completed",
      value: groups.completed.length,
      description: "Tasks completed",
    },
    {
      label: "Expiring",
      value: groups.overdue.length + expiringCount,
      description: "Need your attention",
    },
  ];

  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>

            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      <TaskSection
        className="mt-8"
        title="Today's Tasks"
        count={todayTotal}
        description={describeToday(remainingToday, groups.overdue.length)}
      >
        {todayTotal === 0 ? (
          <TaskList
            tasks={[]}
            now={now}
            onToggleComplete={setTaskCompleted}
            onOpenTask={handleOpenTask}
            onDeleteTask={deleteTask}
            className="mt-6"
            emptyTitle="Nothing here yet"
            emptyMessage="Tasks you add for today will show up right here."
          />
        ) : (
          <div className="mt-6 space-y-6">
            <TaskGroup
              title="Overdue"
              tasks={groups.overdue}
              now={now}
              onToggleComplete={setTaskCompleted}
              onOpenTask={handleOpenTask}
              onDeleteTask={deleteTask}
            />

            {groups.today.length > 0 ? (
              <TaskList
                tasks={groups.today}
                now={now}
                onToggleComplete={setTaskCompleted}
                onOpenTask={handleOpenTask}
                onDeleteTask={deleteTask}
              />
            ) : null}

            <TaskGroup
              title="Completed"
              tasks={groups.completed}
              now={now}
              onToggleComplete={setTaskCompleted}
              onOpenTask={handleOpenTask}
              onDeleteTask={deleteTask}
            />
          </div>
        )}
      </TaskSection>

      <TaskSection
        className="mt-6"
        title="Upcoming"
        count={groups.upcoming.length}
        description={
          groups.upcoming.length === 0
            ? "Nothing beyond today yet."
            : "What is waiting after today."
        }
      >
        <TaskList
          tasks={groups.upcoming}
          now={now}
          onToggleComplete={setTaskCompleted}
          onOpenTask={handleOpenTask}
          onDeleteTask={deleteTask}
          className="mt-6"
          emptyTitle="Your calendar is clear"
          emptyMessage="Tasks dated after today will appear here."
        />
      </TaskSection>
    </>
  );
}

interface TaskSectionProps {
  title: string;
  count: number;
  description: string;
  className?: string;
  children: ReactNode;
}

function TaskSection({
  title,
  count,
  description,
  className,
  children,
}: TaskSectionProps) {
  return (
    <section
      className={cn("rounded-2xl border bg-card p-6 shadow-sm", className)}
    >
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          {title}
          <Badge variant="secondary">{count}</Badge>
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {children}
    </section>
  );
}

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  now: Date;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

/** A labelled slice of a section. Renders nothing while it is empty. */
function TaskGroup({
  title,
  tasks,
  now,
  onToggleComplete,
  onOpenTask,
  onDeleteTask,
}: TaskGroupProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {title}
        </h3>

        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
          {tasks.length}
        </Badge>
      </div>

      <TaskList
        tasks={tasks}
        now={now}
        onToggleComplete={onToggleComplete}
        onOpenTask={onOpenTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}

function describeToday(remaining: number, overdue: number): string {
  if (remaining === 0) {
    return "Everything for today is done.";
  }

  const tasks = `${remaining} task${remaining === 1 ? "" : "s"} left today`;

  return overdue > 0 ? `${tasks} · ${overdue} overdue` : `${tasks}.`;
}
