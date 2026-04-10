import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { PageShell } from "@/components/common/page-shell";
import { FilterBar } from "@/components/common/filter-bar";
import { DataTable } from "@/components/data-table";

type Textbook = { id: string; title: string; description?: string; episodes: { id: string; title: string }[] };
type PageResult<T> = { items: T[]; total: number; page: number; pageSize: number };

export default function TextbooksPage() {
  const { getRootProps, getInputProps } = useDropzone();
  const [items, setItems] = useState<Textbook[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const res = await http.get<PageResult<Textbook>>("/textbooks", { params: { page, pageSize } });
    setItems(res.data.items);
    setTotal(res.data.total);
  };
  useEffect(() => {
    void load();
  }, [page, pageSize]);

  return (
    <PageShell title="教材库" description="教材与分集管理">
      <div
        {...getRootProps()}
        className="rounded-box border border-dashed border-base-300 bg-base-100 p-4 text-sm opacity-70"
      >
        <input {...getInputProps()} />
        拖拽上传教材文件
      </div>
      <FilterBar>
        <input
          className="input input-bordered input-sm"
          placeholder="教材标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="input input-bordered input-sm"
          placeholder="教材描述"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={async () => {
            await http.post("/textbooks", { title, description });
            setTitle("");
            setDescription("");
            setPage(1);
            await load();
          }}
        >
          新增教材
        </button>
      </FilterBar>
      <div className="card card-border bg-base-100">
        <div className="card-body p-4">
        <ReactMarkdown>{description || "# 教材描述预览"}</ReactMarkdown>
        </div>
      </div>
      <DataTable
        title="教材列表"
        rows={items}
        columns={[
          { key: "title", header: "教材标题", render: (item) => item.title },
          { key: "description", header: "描述", render: (item) => item.description || "-" },
          {
            key: "episodes",
            header: "分集",
            render: (item) => (item.episodes || []).map((ep) => ep.title).join(", ") || "无",
          },
        ]}
        pagination={{ page, pageSize, total, onPageChange: setPage }}
      />
    </PageShell>
  );
}
