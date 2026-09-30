"use client";

import { useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import {
  AlarmClock,
  Calendar,
  CircleCheck,
  MoreHorizontal,
  PencilLine,
  Repeat,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { Task } from "./task.types";
import {
  PRIORITY_BADGE_CLASS,
  PRIORITY_DOT_CLASS,
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_RECURRENCE_LABELS,
  formatDueDate,
  formatReminderLabel,
  getTaskDisplayState,
  isTaskCompleted,
} from "./task-utils";

type TaskIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface MetaChipProps {
  icon: TaskIcon;
  children: ReactNode;
  /** Native tooltip, used to spell out abbreviations like "30 min before". */
  title?: string;
  className?: string;
}

/** A single fact about a task: category, due date, reminder, repeat rule. */
function MetaChip({ icon: Icon, children, title, className }: MetaChipProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-5 max-w-full items-center gap-1 overflow-hidden rounded-4xl px-2 text-xs font-medium whitespace-nowrap text-muted-foreground",
        className,
      )}
    >
      <Icon aria-hidden className="size-3 shrink-0" />
      <span className="truncate">{children}</span>
    </span>
  );
}

interface TaskCardProps {
  task: Task;
  /** Reference instant supplied by the server so labels never drift. */
  now: Date;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onOpenTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

/**
 * The canonical representation of a task in the product.
 *
 * The whole card is the "open" affordance, while the checkbox and the
 * more-actions menu sit beside it so completion never requires opening the task.
 */
export function TaskCard({
  task,
  now,
  onToggleComplete,
  onOpenTask,
  onDeleteTask,
}: TaskCardProps) {
  const completed = isTaskCompleted(task);
  const displayState = getTaskDisplayState(task, now);
  const isOverdue = displayState === "overdue";
  const due = task.dueAt ? formatDueDate(task.dueAt, now) : null;
  const reminder = formatReminderLabel(task);

  // Driven from the interaction itself rather than from an effect, so the card
  // animates exactly when the user completes it and never on first paint.
  const [isCompleting, setIsCompleting] = useState(false);

  function handleToggleComplete(nextCompleted: boolean) {
    if (nextCompleted) {
      setIsCompleting(true);
    }

    onToggleComplete(task.id, nextCompleted);
  }

  return (
    <article
      data-state={displayState}
      onAnimationEnd={() => setIsCompleting(false)}
      className={cn(
        "group/task relative flex items-start gap-3 rounded-xl border bg-card p-3.5 shadow-xs",
        "transition-[transform,box-shadow,border-color,opacity] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-ring/40 hover:shadow-md",
        "active:translate-y-0 active:scale-[0.995]",
        "focus-within:border-ring/50",
        "motion-reduce:transform-none motion-reduce:transition-none",
        completed && "opacity-75",
        isCompleting && "animate-task-complete",
      )}
    >
      <div className="pt-0.5">
        <Checkbox
          checked={completed}
          onCheckedChange={(checked) => handleToggleComplete(checked)}
          aria-label={
            completed
              ? `Mark "${task.title}" as not completed`
              : `Mark "${task.title}" as completed`
          }
          className="size-5 rounded-full shadow-none transition-transform duration-200 ease-out hover:scale-110"
        />
      </div>
      <button
        type="button"
        onClick={() => onOpenTask(task.id)}
        aria-label={`Open task: ${task.title}`}
        className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span
          className={cn(
            "block text-sm font-medium text-pretty transition-colors duration-200",
            completed
              ? "text-muted-foreground line-through decoration-muted-foreground/50"
              : "text-foreground",
          )}
        >
          {task.title}
        </span>

        {task.description ? (
          <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {task.description}
          </span>
        ) : null}

        <span className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <Badge variant="outline" className="font-normal text-muted-foreground">
            {TASK_CATEGORY_LABELS[task.category]}
          </Badge>

          <Badge
            className={cn("border-transparent", PRIORITY_BADGE_CLASS[task.priority])}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                PRIORITY_DOT_CLASS[task.priority],
              )}
            />
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>

          {completed ? (
            <MetaChip
              icon={CircleCheck}
              className="bg-(--success-muted) text-(--success)"
            >
              Completed
            </MetaChip>
          ) : null}

          {due ? (
            <MetaChip
              icon={Calendar}
              title={
                due.time ? `Due ${due.date} at ${due.time}` : `Due ${due.date}`
              }
              className={cn(isOverdue && "bg-(--danger-muted) text-(--danger)")}
            >
              {due.date}
              {due.time ? <span className="opacity-70"> · {due.time}</span> : null}
            </MetaChip>
          ) : null}

          {reminder ? (
            <MetaChip icon={AlarmClock} title={`Reminds you ${reminder}`}>
              {reminder}
            </MetaChip>
          ) : null}

          {task.recurringRule !== "none" ? (
            <MetaChip
              icon={Repeat}
              title={TASK_RECURRENCE_LABELS[task.recurringRule]}
            >
              {TASK_RECURRENCE_LABELS[task.recurringRule]}
            </MetaChip>
          ) : null}
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`More actions for "${task.title}"`}
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-muted-foreground/70 hover:text-foreground"
            />
          }
        >
          <MoreHorizontal aria-hidden />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={6} className="w-52">
          <DropdownMenuItem onClick={() => onOpenTask(task.id)}>
            <PencilLine aria-hidden />
            Open details
          </DropdownMenuItem>

          <DropdownMenuCheckboxItem
            checked={completed}
            onCheckedChange={(checked) => handleToggleComplete(checked)}
            closeOnClick={false}
          >
            Mark as complete
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDeleteTask(task.id)}
          >
            <Trash2 aria-hidden />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </article>
  );
}
