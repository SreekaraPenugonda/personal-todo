"use client";

import {
  Bell,
  CheckSquare,
  ChevronRight,
  Clock3,
  FolderLock,
  Home,
  Inbox,
  ListTodo,
  MoreHorizontal,
  Settings,
  UserRound,
} from "lucide-react";

const navigation = [
  { label: "Home", icon: Home, active: true },
  { label: "My Tasks", icon: ListTodo },
];

const categories = [
  { label: "Personal", icon: UserRound },
  { label: "Locked", icon: FolderLock },
  { label: "Office & Academics", icon: CheckSquare },
  { label: "Miscellaneous", icon: MoreHorizontal },
];

const secondaryNavigation = [
  { label: "Reminders", icon: Bell },
  { label: "Recently Deleted", icon: Clock3 },
  { label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobile?: boolean;
}

export function Sidebar({ mobile = false }: SidebarProps) {
  return (
    <aside
      className={[
        "h-screen shrink-0 flex-col border-r bg-sidebar",
        mobile ? "flex w-full" : "hidden w-64 lg:flex",
      ].join(" ")}
    >
      <div className="flex h-16 items-center px-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CheckSquare className="size-5" />
          </div>

          <div className="leading-tight">
            <p className="font-semibold tracking-tight">TaskFlow</p>
            <p className="text-xs text-muted-foreground">
              Stay on top of life
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={[
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
                  "text-sm font-medium transition-all duration-200",
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                ].join(" ")}
              >
                <Icon className="size-[18px]" />
                <span>{item.label}</span>

                {item.active && (
                  <ChevronRight className="ml-auto size-4 opacity-50" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between px-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>

            <button
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Add category"
            >
              +
            </button>
          </div>

          <nav className="space-y-1">
            {categories.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                >
                  <Icon className="size-[18px]" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 border-t pt-4">
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                >
                  <Icon className="size-[18px]" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t p-3">
        <button className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-sidebar-accent/70">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            S
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Your Account</p>
            <p className="truncate text-xs text-muted-foreground">
              Personal workspace
            </p>
          </div>

          <Inbox className="size-4 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
}