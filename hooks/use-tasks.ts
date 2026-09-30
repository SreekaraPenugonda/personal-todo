"use client";

import { useCallback, useMemo, useState } from "react";

import type { Task } from "@/features/tasks/task.types";
import {
  compareTasks,
  isTaskCompleted,
  isTaskDueToday,
} from "@/features/tasks/task-utils";

/**
 * The task lists a day view needs. Every group is pre-sorted so views stay
 * presentational.
 */
export interface TaskGroups {
  /** Still open and already late. */
  overdue: Task[];
  /** Still open and due today (or with no date yet). */
  today: Task[];
  /** Completed today. */
  completed: Task[];
  /** Still open and due after today. */
  upcoming: Task[];
}

export interface UseTasksResult {
  groups: TaskGroups;
  setTaskCompleted: (taskId: string, completed: boolean) => void;
  deleteTask: (taskId: string) => void;
}

/**
 * Owns the task collection for the client.
 *
 * Keeping this state out of the components is what lets step 7 swap the local
 * mutations for real CRUD calls in exactly one place.
 */
export function useTasks(initialTasks: Task[], now: Date): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const setTaskCompleted = useCallback((taskId: string, completed: boolean) => {
    const timestamp = new Date().toISOString();

    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: completed ? "completed" : "active",
              completedAt: completed ? timestamp : null,
              lastActivityAt: timestamp,
              updatedAt: timestamp,
            }
          : task,
      ),
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    // TODO(step 4): deleting becomes a soft delete so the task can be restored
    // from "Recently Deleted".
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }, []);

  const groups = useMemo(() => groupTasks(tasks, now), [tasks, now]);

  return { groups, setTaskCompleted, deleteTask };
}

function groupTasks(tasks: Task[], now: Date): TaskGroups {
  const nowTime = now.getTime();

  const groups: TaskGroups = {
    overdue: [],
    today: [],
    completed: [],
    upcoming: [],
  };

  for (const task of tasks) {
    if (isTaskCompleted(task)) {
      // Only today's completions belong in a day view. Older history moves
      // behind the "Completed" destination once persistence lands.
      if (task.dueAt === null || isTaskDueToday(task, now)) {
        groups.completed.push(task);
      }

      continue;
    }

    if (task.dueAt === null) {
      // An undated task is still on the plate, so it belongs with today.
      groups.today.push(task);
      continue;
    }

    const dueTime = new Date(task.dueAt).getTime();

    if (dueTime < nowTime) {
      groups.overdue.push(task);
    } else if (isTaskDueToday(task, now)) {
      groups.today.push(task);
    } else {
      groups.upcoming.push(task);
    }
  }

  groups.overdue.sort(compareTasks);
  groups.today.sort(compareTasks);
  groups.upcoming.sort(compareTasks);
  groups.completed.sort((a, b) => compareTasks(b, a));

  return groups;
}
