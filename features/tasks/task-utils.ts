import type {
  Task,
  TaskCategory,
  TaskDisplayState,
  TaskPriority,
  TaskRecurrence,
} from "./task.types";

/**
 * Locale is pinned rather than left to the runtime default so the server and
 * the client always render identical date strings (no hydration mismatch).
 */
export const DATE_LOCALE = "en-US";

const MINUTE = 60_000;
const DAY = 86_400_000;
/** A task is "expiring" once it is inside this window. */
const EXPIRING_WINDOW_MS = DAY;

/* ------------------------------------------------------------------------- *
 * Labels
 * ------------------------------------------------------------------------- */

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  personal: "Personal",
  locked: "Locked",
  office: "Office & Academics",
  miscellaneous: "Miscellaneous",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const TASK_RECURRENCE_LABELS: Record<TaskRecurrence, string> = {
  none: "Does not repeat",
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
  yearly: "Every year",
};

/** Sort weight, highest priority first. */
export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/* ------------------------------------------------------------------------- *
 * Accents
 *
 * These resolve the `--task-*`, `--danger*`, `--warning*` and `--success*`
 * design tokens declared in `app/globals.css`, so every accent follows the
 * light/dark theme automatically.
 * ------------------------------------------------------------------------- */

/** Tinted badge used for the priority chip. */
export const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-(--warning-muted) text-(--warning)",
  urgent: "bg-(--danger-muted) text-(--danger)",
};

/** Small status dot shown inside the priority chip. */
export const PRIORITY_DOT_CLASS: Record<TaskPriority, string> = {
  low: "bg-muted-foreground/60",
  medium: "bg-primary",
  high: "bg-(--warning)",
  urgent: "bg-(--danger)",
};

/* ------------------------------------------------------------------------- *
 * Derived state
 * ------------------------------------------------------------------------- */

export function isTaskCompleted(task: Task): boolean {
  return task.completedAt !== null || task.status === "completed";
}

/** The due time has already passed and the task is still open. */
export function isTaskOverdue(task: Task, now: Date): boolean {
  if (!task.dueAt || isTaskCompleted(task)) {
    return false;
  }

  return new Date(task.dueAt).getTime() < now.getTime();
}

/** Still open, not yet late, but due inside the next 24 hours. */
export function isTaskExpiring(task: Task, now: Date): boolean {
  if (!task.dueAt || isTaskCompleted(task)) {
    return false;
  }

  const remaining = new Date(task.dueAt).getTime() - now.getTime();
  return remaining >= 0 && remaining <= EXPIRING_WINDOW_MS;
}

export function getTaskDisplayState(task: Task, now: Date): TaskDisplayState {
  if (isTaskCompleted(task)) {
    return "completed";
  }

  if (isTaskOverdue(task, now)) {
    return "overdue";
  }

  if (isTaskExpiring(task, now)) {
    return "expiring";
  }

  return "active";
}

/** Whole calendar days between two instants, ignoring the time of day. */
export function differenceInCalendarDays(value: Date, reference: Date): number {
  return Math.round((startOfDay(value) - startOfDay(reference)) / DAY);
}

export function isTaskDueToday(task: Task, now: Date): boolean {
  if (!task.dueAt) {
    return false;
  }

  return differenceInCalendarDays(new Date(task.dueAt), now) === 0;
}

/* ------------------------------------------------------------------------- *
 * Formatting
 * ------------------------------------------------------------------------- */

const weekdayFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  weekday: "long",
});

const monthDayFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  month: "short",
  day: "numeric",
});

const monthDayYearFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(DATE_LOCALE, {
  hour: "numeric",
  minute: "2-digit",
});

export interface DueDateLabel {
  /** "Today" | "Yesterday" | "Tomorrow" | "Thursday" | "Sep 30" | "Sep 30, 2027" */
  date: string;
  /** "6:00 PM", or `null` when the task has a date but no specific time. */
  time: string | null;
}

export function formatDueDate(dueAt: string, now: Date): DueDateLabel {
  const due = new Date(dueAt);
  const dayOffset = differenceInCalendarDays(due, now);

  let date: string;

  if (dayOffset === 0) {
    date = "Today";
  } else if (dayOffset === -1) {
    date = "Yesterday";
  } else if (dayOffset === 1) {
    date = "Tomorrow";
  } else if (dayOffset > 1 && dayOffset < 7) {
    date = weekdayFormatter.format(due);
  } else if (due.getFullYear() === now.getFullYear()) {
    date = monthDayFormatter.format(due);
  } else {
    date = monthDayYearFormatter.format(due);
  }

  // A due date stored at local midnight means "this day, no specific time".
  const hasTimeOfDay = due.getHours() !== 0 || due.getMinutes() !== 0;

  return { date, time: hasTimeOfDay ? timeFormatter.format(due) : null };
}

/**
 * Human readable reminder description, phrased relative to the due time.
 *
 * Storing the reminder as an offset from `dueAt` is also what keeps a reminder
 * correct when the user later changes the due date, so this is the phrasing the
 * Task Details view (step 3) will reuse.
 */
export function formatReminderLabel(task: Task): string | null {
  if (!task.reminderAt) {
    return null;
  }

  if (!task.dueAt) {
    return timeFormatter.format(new Date(task.reminderAt));
  }

  const offsetInMinutes = Math.round(
    (new Date(task.dueAt).getTime() - new Date(task.reminderAt).getTime()) / MINUTE,
  );

  return formatReminderOffset(offsetInMinutes);
}

function formatReminderOffset(offsetInMinutes: number): string {
  if (offsetInMinutes <= 0) {
    return "At due time";
  }

  if (offsetInMinutes % 1440 === 0) {
    return `${pluralize(offsetInMinutes / 1440, "day")} before`;
  }

  if (offsetInMinutes % 60 === 0) {
    return `${pluralize(offsetInMinutes / 60, "hour")} before`;
  }

  return `${offsetInMinutes} min before`;
}

function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

/** Orders tasks the way a person reads a day: soonest first, then by priority. */
export function compareTasks(a: Task, b: Task): number {
  const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
  const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;

  if (aDue !== bDue) {
    return aDue - bDue;
  }

  const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];

  if (byPriority !== 0) {
    return byPriority;
  }

  return a.title.localeCompare(b.title);
}

function startOfDay(date: Date): number {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}
