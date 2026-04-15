"use client";

import type { ReactNode } from "react";
import { TabBar } from "./ui";

export function ClientShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <TabBar />
    </>
  );
}
