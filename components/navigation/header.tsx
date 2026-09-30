"use client";

import { Bell, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { QuickAddTaskDialog } from "@/features/tasks/quick-add-task-dialog";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">T</span>
          </div>

          <span className="font-semibold">TaskFlow</span>
        </div>
      </div>

      <div className="hidden max-w-md flex-1 lg:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search your tasks..."
            className="h-10 border-transparent bg-muted/60 pl-9 shadow-none transition-colors focus-visible:border-border focus-visible:bg-background"
          />

          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground xl:block">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <QuickAddTaskDialog />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </Button>

        <button
          className="ml-1 flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-transform hover:scale-105"
          aria-label="Account"
        >
          S
        </button>
      </div>
    </header>
  );
}