import { PageShell } from "@/components/common/page-shell";

export default function ForbiddenPage() {
  return (
    <PageShell title="403" description="无权限访问">
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        你没有访问当前页面的权限。
      </div>
    </PageShell>
  );
}
