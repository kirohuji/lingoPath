import { ReactNode } from "react";

export function DataTable({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
