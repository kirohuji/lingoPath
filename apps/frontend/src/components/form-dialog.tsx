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
    <div className="modal modal-open" role="dialog">
      <div className="modal-box">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
      <div className="modal-backdrop bg-black/30" />
    </div>
  );
}
