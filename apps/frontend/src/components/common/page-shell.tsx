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
    <section className="space-y-5">
      <header className="rounded-2xl border border-base-300/60 bg-base-100/80 px-5 py-4 shadow-sm backdrop-blur">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-sm opacity-70">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
