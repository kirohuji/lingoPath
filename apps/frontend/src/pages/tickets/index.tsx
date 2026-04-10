import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { PageShell } from "@/components/common/page-shell";
import { SearchFilterBar } from "@/components/common/search-filter-bar";
import { DataTable } from "@/components/data-table";
import { FormDialog } from "@/components/form-dialog";

type Ticket = { id: string; subject: string; content: string; status: string; priority: string; replies?: { id: string }[] };
type PageResult<T> = { items: T[]; total: number; page: number; pageSize: number };

export default function TicketsPage() {
  const [items, setItems] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const load = async () => {
    const res = await http.get<PageResult<Ticket>>("/tickets", { params: { page, pageSize } });
    setItems(res.data.items);
    setTotal(res.data.total);
  };
  useEffect(() => {
    void load();
  }, [page, pageSize]);

  return (
    <PageShell title="工单管理" description="工单状态流转与回复">
      <SearchFilterBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索主题/内容">
        <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>新建工单</button>
      </SearchFilterBar>
      <DataTable
        title="工单列表"
        rows={items.filter((item) => `${item.subject} ${item.content}`.toLowerCase().includes(keyword.trim().toLowerCase()))}
        columns={[
          { key: "subject", header: "主题", render: (item) => item.subject },
          { key: "content", header: "内容", render: (item) => item.content },
          { key: "status", header: "状态", render: (item) => item.status },
          { key: "priority", header: "优先级", render: (item) => item.priority },
          {
            key: "actions",
            header: "操作",
            render: (item) => (
              <div className="flex gap-2">
                <button className="btn btn-outline btn-xs" onClick={async () => { await http.patch(`/tickets/${item.id}/status`, { status: "processing" }); await load(); }}>处理</button>
                <button className="btn btn-outline btn-xs" onClick={async () => { await http.patch(`/tickets/${item.id}/status`, { status: "resolved" }); await load(); }}>解决</button>
              </div>
            ),
          },
        ]}
        pagination={{ page, pageSize, total, onPageChange: setPage }}
      />
      <FormDialog
        title="新建工单"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        confirmDisabled={!subject.trim() || !content.trim()}
        onConfirm={async () => {
          await http.post("/tickets", { subject: subject.trim(), content: content.trim() });
          setSubject("");
          setContent("");
          setCreateOpen(false);
          setPage(1);
          await load();
        }}
      >
        <div className="space-y-3">
          <input className="input input-bordered w-full" placeholder="工单主题" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <textarea className="textarea textarea-bordered w-full" placeholder="工单内容" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
      </FormDialog>
    </PageShell>
  );
}
