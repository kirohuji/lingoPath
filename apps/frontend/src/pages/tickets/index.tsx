import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { PageShell } from "@/components/common/page-shell";
import { FilterBar } from "@/components/common/filter-bar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

type Ticket = { id: string; subject: string; content: string; status: string; priority: string; replies?: { id: string }[] };

export default function TicketsPage() {
  const [items, setItems] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const load = async () => {
    const res = await http.get("/tickets");
    setItems(res.data);
  };
  useEffect(() => {
    void load();
  }, []);

  return (
    <PageShell title="工单管理" description="工单状态流转与回复">
      <FilterBar>
        <Input placeholder="工单主题" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Input placeholder="工单内容" value={content} onChange={(e) => setContent(e.target.value)} />
        <Button
          size="sm"
          onClick={async () => {
            await http.post("/tickets", { subject, content });
            setSubject("");
            setContent("");
            await load();
          }}
        >
          新建工单
        </Button>
      </FilterBar>
      <DataTable title="工单列表">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <span>{item.subject} / {item.status}</span>
            <Button size="sm" variant="outline" onClick={async () => { await http.patch(`/tickets/${item.id}/status`, { status: "processing" }); await load(); }}>处理</Button>
            <Button size="sm" variant="outline" onClick={async () => { await http.patch(`/tickets/${item.id}/status`, { status: "resolved" }); await load(); }}>解决</Button>
          </div>
        ))}
      </DataTable>
    </PageShell>
  );
}
