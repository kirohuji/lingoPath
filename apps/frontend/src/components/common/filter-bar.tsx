import { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-white p-3">{children}</div>;
}
