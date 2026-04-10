import { useDropzone } from "react-dropzone";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { http } from "@/modules/http";
import { PageShell } from "@/components/common/page-shell";
import { FilterBar } from "@/components/common/filter-bar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

type Textbook = { id: string; title: string; description?: string; episodes: { id: string; title: string }[] };

export default function TextbooksPage() {
  const { getRootProps, getInputProps } = useDropzone();
  const [items, setItems] = useState<Textbook[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const res = await http.get("/textbooks");
    setItems(res.data);
  };
  useEffect(() => {
    void load();
  }, []);

  return (
    <PageShell title="教材库" description="教材与分集管理">
      <div {...getRootProps()} className="rounded-lg border border-dashed bg-white p-4">
        <input {...getInputProps()} />
        拖拽上传教材文件
      </div>
      <FilterBar>
        <Input placeholder="教材标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="教材描述" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button
          size="sm"
          onClick={async () => {
            await http.post("/textbooks", { title, description });
            setTitle("");
            setDescription("");
            await load();
          }}
        >
          新增教材
        </Button>
      </FilterBar>
      <ReactMarkdown>{description || "# 教材描述预览"}</ReactMarkdown>
      <DataTable title="教材列表">
        {items.map((item) => (
          <div key={item.id}>
            {item.title} / 分集 {(item.episodes || []).map((ep) => ep.title).join(", ") || "无"}
          </div>
        ))}
      </DataTable>
    </PageShell>
  );
}
