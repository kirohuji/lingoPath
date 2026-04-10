import { ReactNode } from "react";
import { FilterBar } from "./filter-bar";

export function SearchFilterBar({
  keyword,
  onKeywordChange,
  placeholder = "搜索关键词",
  children,
}: {
  keyword: string;
  onKeywordChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <FilterBar>
      <div className="flex w-full flex-wrap items-center gap-2 md:gap-3">
        <input
          className="input input-bordered input-sm w-full md:flex-1"
          placeholder={placeholder}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
        {children ? <div className="ml-auto flex items-center gap-2">{children}</div> : null}
      </div>
    </FilterBar>
  );
}
