import { PageShell } from "@/components/common/page-shell";

export default function ForbiddenPage() {
  return (
    <PageShell title="403" description="无权限访问">
      <div className="rounded-lg border bg-white p-4">你没有访问当前页面的权限。</div>
    </PageShell>
  );
}
