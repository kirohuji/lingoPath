import { ReactNode } from "react";

export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
