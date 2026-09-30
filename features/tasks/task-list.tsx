import { ListTodo } from "lucide-react";

import { cn } from "@/lib/utils";

import { TaskCard } from "./task-card";
import type { Task } from "./task.types";

interface TaskListProps {
  tasks: Task[];
  now: Date;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * Presentational list of tasks.
 *
 * It deliberately knows nothing about *how* a task is completed or deleted —
 * every action is delegated. That is what makes it reusable for the category,
 * search and completed views later on.
 */
export function TaskList({
  tasks,
  now,
  onToggleComplete,
  onOpenTask,
  onDeleteTask,
  emptyTitle = "Nothing here yet",
  emptyMessage = "Create your first task to get started.",
  className,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center",
          className,
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border">
          <ListTodo aria-hidden className="size-5" />
        </div>

        <p className="font-medium">{emptyTitle}</p>

        <p className="max-w-sm text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className={cn("space-y-2.5", className)}>
      {tasks.map((task) => (
        <li key={task.id} className="animate-task-enter">
          <TaskCard
            task={task}
            now={now}
            onToggleComplete={onToggleComplete}
            onOpenTask={onOpenTask}
            onDeleteTask={onDeleteTask}
          />
        </li>
      ))}
    </ul>
  );
}
