import { ReactNode } from "react";

export function FormDialog({
  title,
  open,
  confirmText = "保存",
  cancelText = "取消",
  onConfirm,
  onCancel,
  confirmDisabled,
  children,
}: {
  title: string;
  open: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmDisabled?: boolean;
  children?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog">
      <div className="modal-box">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-4">{children}</div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-primary" disabled={confirmDisabled} onClick={() => void onConfirm?.()}>
            {confirmText}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/30" onClick={onCancel} />
    </div>
  );
}
