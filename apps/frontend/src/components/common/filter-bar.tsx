import { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="card card-border bg-base-100 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 p-3 md:gap-3 md:p-4">
      {children}
      </div>
    </div>
  );
}
