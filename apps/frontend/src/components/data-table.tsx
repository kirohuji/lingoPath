import { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: ReactNode;
  className?: string;
  render: (row: T) => ReactNode;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function DataTable<T>({
  title,
  children,
  columns,
  rows,
  pagination,
}: {
  title: string;
  children?: ReactNode;
  columns?: Column<T>[];
  rows?: T[];
  pagination?: Pagination;
}) {
  const legacyRows = Array.isArray(children) ? children : children ? [children] : [];
  const structuredColumns = columns ?? [];
  const structuredRows = rows ?? [];
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
  const hasStructuredTable = structuredColumns.length > 0;

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body p-4">
        <h3 className="mb-3 text-sm font-semibold">{title}</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                {hasStructuredTable ? (
                  structuredColumns.map((column) => (
                    <th key={column.key} className={column.className}>
                      {column.header}
                    </th>
                  ))
                ) : (
                  <th>内容</th>
                )}
              </tr>
            </thead>
            <tbody>
              {hasStructuredTable ? (
                structuredRows.length === 0 ? (
                  <tr>
                    <td className="opacity-70" colSpan={structuredColumns.length}>暂无数据</td>
                  </tr>
                ) : (
                  structuredRows.map((row, idx) => (
                    <tr key={idx}>
                      {structuredColumns.map((column) => (
                        <td key={`${column.key}-${idx}`} className={column.className}>
                          {column.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))
                )
              ) : legacyRows.length === 0 ? (
                <tr>
                  <td className="opacity-70">暂无数据</td>
                </tr>
              ) : (
                legacyRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination ? (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="opacity-70">
              第 {pagination.page} / {totalPages} 页，共 {pagination.total} 条
            </span>
            <div className="join">
              <button
                className="btn btn-sm join-item"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                上一页
              </button>
              <button
                className="btn btn-sm join-item"
                disabled={pagination.page >= totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                下一页
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
