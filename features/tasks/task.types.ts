/**
 * The task domain model.
 *
 * This is the single source of truth for *what a task is*: the fields it owns
 * and the finite values those fields can take.
 *
 * Everything else is expected to derive from here:
 *   - the UI (`task-card.tsx`) reads these fields,
 *   - the Quick Add form's Zod schema (step 2) reuses these tuples,
 *   - the PostgreSQL / Supabase tables (step 5) map 1:1 onto these names.
 *
 * The business rules that *use* these fields — when a task expires, what
 * renewing does, whether a completed task can expire, when the one-week timer
 * starts — are deliberately still open. They are specified in step 4 before any
 * tables are created.
 */

/** The bucket a task belongs to. Mirrors the sidebar's category shortcuts. */
export const TASK_CATEGORIES = [
  "personal",
  "locked",
  "office",
  "miscellaneous",
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

/** How much attention a task is asking for. */
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

/**
 * Lifecycle status.
 *
 * `active` and `completed` are the only values a user sets directly. The rest
 * are system transitions: `overdue` and `expiring` are currently *derived* from
 * `dueAt` (see `getTaskDisplayState`), while `renewed`, `expired` and
 * `recently_deleted` are reserved for the expiry/renewal/deletion rules that
 * step 4 pins down.
 */
export const TASK_STATUSES = [
  "active",
  "completed",
  "overdue",
  "expiring",
  "renewed",
  "expired",
  "recently_deleted",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

/** How often a task comes back after it is completed. */
export const TASK_RECURRENCES = [
  "none",
  "daily",
  "weekly",
  "monthly",
  "yearly",
] as const;

export type TaskRecurrence = (typeof TASK_RECURRENCES)[number];

/**
 * How a task presents itself right now, derived from `status` + `dueAt`.
 *
 * Not persisted: it is a read model used for colours, grouping and counts.
 */
export type TaskDisplayState = "active" | "completed" | "overdue" | "expiring";

/**
 * A task as it is stored and read back.
 *
 * All timestamps are ISO-8601 strings so they survive the Server -> Client
 * boundary unchanged and map directly onto `timestamptz` columns later.
 */
export interface Task {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly description: string | null;
  readonly category: TaskCategory;
  readonly priority: TaskPriority;
  readonly status: TaskStatus;
  /** When the task is due. `null` means it has no date yet. */
  readonly dueAt: string | null;
  /** When the user should be reminded. `null` means no reminder. */
  readonly reminderAt: string | null;
  readonly recurringRule: TaskRecurrence;
  readonly completedAt: string | null;
  /** Any user or system action that touched the task. */
  readonly lastActivityAt: string;
  /** When the task stops being actionable. Part of the step 4 rules. */
  readonly expiresAt: string | null;
  /** Set when a user renews an expiring task. Part of the step 4 rules. */
  readonly renewedUntil: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
