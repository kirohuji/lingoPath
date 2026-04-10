import { PageShell } from "@/components/common/page-shell";

export default function ForbiddenPage() {
  return (
    <PageShell title="403" description="无权限访问">
      <div className="card card-border bg-base-100">
        <div className="card-body p-4 text-sm opacity-70">
        你没有访问当前页面的权限。
        </div>
      </div>
    </PageShell>
  );
}
