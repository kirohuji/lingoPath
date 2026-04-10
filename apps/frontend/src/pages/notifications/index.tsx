import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { http } from "@/modules/http";
import { useAuthStore } from "@/stores/auth-store";
import { PageShell } from "@/components/common/page-shell";
import { DataTable } from "@/components/data-table";
import { SearchFilterBar } from "@/components/common/search-filter-bar";

type NotificationItem = { id: string; title: string; body: string; read: boolean };
type PageResult<T> = { items: T[]; total: number; page: number; pageSize: number };

export default function NotificationsPage() {
  const token = useAuthStore((s) => s.token);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const socketUrl = useMemo(() => import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", []);

  const load = async () => {
    const [listRes, unreadRes] = await Promise.all([
      http.get<PageResult<NotificationItem>>("/notifications", { params: { page, pageSize } }),
      http.get("/notifications/unread-count"),
    ]);
    setItems(listRes.data.items);
    setTotal(listRes.data.total);
    setUnreadCount(unreadRes.data);
  };
  useEffect(() => { void load(); }, [page, pageSize]);
  useEffect(() => {
    if (!token) return;
    const socket = io(socketUrl, { auth: { token } });
    socket.on("notifications:changed", () => void load());
    return () => {
      socket.disconnect();
    };
  }, [socketUrl, token]);

  return (
    <PageShell title="通知中心" description={`未读 ${unreadCount}`}>
      <SearchFilterBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索标题/内容">
        <button className="btn btn-outline btn-sm" onClick={async () => { await http.patch("/notifications/read-all"); await load(); }}>
          全部标记已读
        </button>
      </SearchFilterBar>
      <DataTable
        title="通知列表"
        rows={items.filter((item) => `${item.title} ${item.body}`.toLowerCase().includes(keyword.trim().toLowerCase()))}
        columns={[
          { key: "title", header: "标题", render: (item) => item.title },
          { key: "body", header: "内容", render: (item) => item.body },
          { key: "read", header: "状态", render: (item) => (item.read ? "已读" : "未读") },
          {
            key: "action",
            header: "操作",
            render: (item) =>
              item.read ? (
                "-"
              ) : (
                <button className="btn btn-outline btn-xs" onClick={async () => { await http.patch(`/notifications/${item.id}/read`); await load(); }}>
                  标记已读
                </button>
              ),
          },
        ]}
        pagination={{ page, pageSize, total, onPageChange: setPage }}
      />
    </PageShell>
  );
}
