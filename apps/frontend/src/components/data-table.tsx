import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTable({ title, children }: { title: string; children?: ReactNode }) {
  const rows = Array.isArray(children) ? children : children ? [children] : [];
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>内容</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell className="text-muted-foreground">暂无数据</TableCell>
            </TableRow>
          ) : (
            rows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
