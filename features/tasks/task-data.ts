import type {
  Task,
  TaskCategory,
  TaskPriority,
  TaskRecurrence,
} from "./task.types";

/**
 * Placeholder task repository.
 *
 * There is no persistence yet, so this module is the *only* place that knows
 * where tasks come from. When step 5 lands, the body of `listTasks` becomes a
 * Supabase query and nothing in the UI has to change.
 *
 * Due dates are expressed as offsets from the current calendar day so the
 * seeded dashboard always reads like "today". Timezone handling becomes a real
 * concern as soon as tasks come from the database, so it is deliberately parked
 * until the domain rules (step 4) and the schema (step 5) exist.
 */

const SEED_USER_ID = "user_local";
const DAY_MS = 86_400_000;

interface SeedTask {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  /**
   * `null` while a task has no due date at all. A `hour` of `null` means "this
   * day, but no specific time" — a distinction the schema will make explicit
   * with a `dueHasTime` flag in step 5.
   */
  due: { dayOffset: number; hour: number | null } | null;
  /** Minutes before `dueAt` that the reminder should fire. */
  reminderMinutesBefore: number | null;
  recurringRule: TaskRecurrence;
  completed: boolean;
}

const SEED_TASKS: SeedTask[] = [
  {
    id: "task-finish-report",
    title: "Finish project report",
    description: "Complete the final report and submit it to the professor.",
    category: "office",
    priority: "high",
    due: { dayOffset: 0, hour: 18 },
    reminderMinutesBefore: 30,
    recurringRule: "none",
    completed: false,
  },
  {
    id: "task-buy-groceries",
    title: "Buy groceries",
    description: "Milk, eggs, coffee beans and something for dinner.",
    category: "personal",
    priority: "medium",
    due: { dayOffset: 0, hour: 20 },
    reminderMinutesBefore: 60,
    recurringRule: "none",
    completed: false,
  },
  {
    id: "task-review-assignment",
    title: "Review assignment",
    description: "Read through the peer review notes before class.",
    category: "office",
    priority: "low",
    due: { dayOffset: 1, hour: null },
    reminderMinutesBefore: null,
    recurringRule: "none",
    completed: false,
  },
  {
    id: "task-reply-professor",
    title: "Reply to professor's email",
    description: null,
    category: "office",
    priority: "high",
    due: { dayOffset: -1, hour: 17 },
    reminderMinutesBefore: 60,
    recurringRule: "none",
    completed: false,
  },
  {
    id: "task-water-plants",
    title: "Water the plants",
    description: null,
    category: "personal",
    priority: "low",
    due: { dayOffset: 0, hour: 8 },
    reminderMinutesBefore: null,
    recurringRule: "none",
    completed: true,
  },
  {
    id: "task-team-sync",
    title: "Weekly team sync",
    description: "Bring the status update and blockers list.",
    category: "office",
    priority: "medium",
    due: { dayOffset: 1, hour: 10 },
    reminderMinutesBefore: 10,
    recurringRule: "weekly",
    completed: false,
  },
  {
    id: "task-electricity-bill",
    title: "Pay electricity bill",
    description: "Amount varies by month — check the meter reading first.",
    category: "miscellaneous",
    priority: "urgent",
    due: { dayOffset: 4, hour: null },
    reminderMinutesBefore: null,
    recurringRule: "monthly",
    completed: false,
  },
];

/**
 * Reads the current user's tasks.
 *
 * Returns a promise even though the seed data is in-memory so that callers are
 * already written for the asynchronous Supabase version.
 */
export async function listTasks(now: Date): Promise<Task[]> {
  return SEED_TASKS.map((seed) => buildTask(seed, now));
}

function buildTask(seed: SeedTask, now: Date): Task {
  const dueAt = resolveDueAt(seed.due, now);
  const timestamp = now.toISOString();

  return {
    id: seed.id,
    userId: SEED_USER_ID,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    priority: seed.priority,
    status: seed.completed ? "completed" : "active",
    dueAt,
    reminderAt: resolveReminderAt(dueAt, seed.reminderMinutesBefore),
    recurringRule: seed.recurringRule,
    completedAt: seed.completed ? timestamp : null,
    lastActivityAt: timestamp,
    expiresAt: null,
    renewedUntil: null,
    // Placeholder values — real ones arrive with the database in step 5.
    createdAt: new Date(now.getTime() - 2 * DAY_MS).toISOString(),
    updatedAt: timestamp,
  };
}

function resolveDueAt(due: SeedTask["due"], now: Date): string | null {
  if (!due) {
    return null;
  }

  const date = new Date(now);
  date.setDate(date.getDate() + due.dayOffset);
  date.setHours(due.hour ?? 0, 0, 0, 0);

  return date.toISOString();
}

function resolveReminderAt(
  dueAt: string | null,
  minutesBefore: number | null,
): string | null {
  if (!dueAt || minutesBefore === null) {
    return null;
  }

  return new Date(new Date(dueAt).getTime() - minutesBefore * 60_000).toISOString();
}
