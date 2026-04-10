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
      <input
        className="input input-bordered input-sm"
        placeholder={placeholder}
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
      />
      {children}
    </FilterBar>
  );
}
