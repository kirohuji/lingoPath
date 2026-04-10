import { ReactNode } from "react";

export function FormDialog({
  title,
  open,
  children,
}: {
  title: string;
  open: boolean;
  children?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div style={{ border: "1px solid #ddd", padding: 16, marginTop: 12 }}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}
