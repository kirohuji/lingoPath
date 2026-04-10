import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { http } from "@/modules/http";
import { useAuthStore } from "@/stores/auth-store";
import { PageShell } from "@/components/common/page-shell";

type NotificationItem = { id: string; title: string; body: string; read: boolean };

export default function NotificationsPage() {
  const token = useAuthStore((s) => s.token);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketUrl = useMemo(() => import.meta.env.VITE_SOCKET_URL || "http://localhost:3000", []);

  const load = async () => {
    const [listRes, unreadRes] = await Promise.all([
      http.get("/notifications"),
      http.get("/notifications/unread-count"),
    ]);
    setItems(listRes.data);
    setUnreadCount(unreadRes.data);
  };
  useEffect(() => { void load(); }, []);
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
      <Button size="sm" variant="outline" onClick={async () => { await http.patch("/notifications/read-all"); await load(); }}>
        全部标记已读
      </Button>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border bg-white p-3">
            <div className="flex items-center justify-between">
              <strong>{item.title}</strong>
              <span>{item.read ? "已读" : "未读"}</span>
            </div>
            <div className="text-sm text-slate-600">{item.body}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
