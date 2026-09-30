"use client";

import { useState } from "react";

import { Header } from "@/components/navigation/header";
import { Sidebar } from "@/components/navigation/sidebar";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop navigation */}
      <Sidebar />

      {/* Mobile navigation */}
      <Sheet
        open={mobileNavigationOpen}
        onOpenChange={setMobileNavigationOpen}
      >
        <SheetContent
          side="left"
          className="w-72 border-r bg-sidebar p-0"
        >
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() => setMobileNavigationOpen(true)}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}