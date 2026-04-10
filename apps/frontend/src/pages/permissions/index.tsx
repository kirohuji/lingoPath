import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/common/page-shell";

type PermissionItem = { id: string; code: string };

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);

  const loadPermissions = async () => {
    const res = await http.get("/permissions");
    setPermissions(res.data);
  };

  useEffect(() => {
    void loadPermissions();
  }, []);

  return (
    <PageShell title="权限管理" description="系统权限码列表">
      <DataTable
        title="权限列表"
        rows={permissions}
        columns={[
          { key: "id", header: "ID", render: (p) => p.id },
          { key: "code", header: "权限码", render: (p) => p.code },
        ]}
      />
    </PageShell>
  );
}
