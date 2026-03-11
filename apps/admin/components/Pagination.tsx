"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

// ─── Page number window ───────────────────────────────────────────────────────

function getPageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 1) return [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current <= 4) {
    for (let i = 2; i <= Math.min(5, total - 1); i++) pages.push(i);
    pages.push("…");
  } else if (current >= total - 3) {
    pages.push("…");
    for (let i = Math.max(total - 4, 2); i <= total - 1; i++) pages.push(i);
  } else {
    pages.push("…");
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push("…");
  }

  pages.push(total);
  return pages;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
  /** Current page (1-indexed) */
  page:    number;
  /** Total number of pages */
  pages:   number;
  /** Total record count */
  total:   number;
  /** Records per page */
  limit:   number;
  onPageChange:   (page: number)  => void;
  onLimitChange?: (limit: number) => void;
  /** Available per-page options — defaults to [10, 20, 50, 100] */
  limitOptions?: number[];
  /** Whether data is loading (disables all controls) */
  loading?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Pagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50, 100],
  loading = false,
  className = "",
}: PaginationProps) {
  if (total === 0) return null;

  const from  = (page - 1) * limit + 1;
  const to    = Math.min(page * limit, total);
  const win   = getPageWindow(page, pages);
  const dis   = loading;

  const btn = (
    label: React.ReactNode,
    onClick: () => void,
    disabled: boolean,
    title: string,
    active?: boolean,
  ) => (
    <button
      key={title}
      onClick={onClick}
      disabled={disabled || dis}
      title={title}
      aria-label={title}
      aria-current={active ? "page" : undefined}
      className={[
        "inline-flex items-center justify-center h-8 min-w-[32px] px-1.5 rounded-md text-xs font-medium border transition-all duration-150 select-none",
        active
          ? "border-[#d96b82] bg-[#d96b82] text-white shadow-sm"
          : disabled || dis
          ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
          : "border-gray-200 bg-white text-gray-600 hover:border-[#f4b6c2] hover:text-[#d96b82] hover:bg-pink-50",
      ].join(" ")}
    >
      {label}
    </button>
  );

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-white ${className}`}
    >
      {/* ── Left: record range + per-page ─────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-gray-500 tabular-nums whitespace-nowrap">
          {total === 0 ? "Không có kết quả" : `Hiển thị ${from}–${to} / ${total}`}
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 whitespace-nowrap">Mỗi trang</span>
            <select
              value={limit}
              onChange={(e) => { onLimitChange(Number(e.target.value)); }}
              disabled={dis}
              className="h-7 px-2 text-xs rounded-md border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#f4b6c2] focus:ring-1 focus:ring-[#f4b6c2] disabled:opacity-50 cursor-pointer"
            >
              {limitOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Right: page controls ───────────────────────────────────────── */}
      {pages > 1 && (
        <div className="flex items-center gap-1">
          {/* First */}
          {btn(
            <ChevronsLeft size={13} />,
            () => onPageChange(1),
            page === 1,
            "Trang đầu",
          )}
          {/* Prev */}
          {btn(
            <ChevronLeft size={13} />,
            () => onPageChange(page - 1),
            page === 1,
            "Trang trước",
          )}

          {/* Page numbers */}
          {win.map((n, i) =>
            n === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="inline-flex items-center justify-center h-8 w-7 text-xs text-gray-400 select-none"
              >
                …
              </span>
            ) : (
              btn(
                String(n),
                () => onPageChange(n as number),
                false,
                `Trang ${n}`,
                n === page,
              )
            )
          )}

          {/* Next */}
          {btn(
            <ChevronRight size={13} />,
            () => onPageChange(page + 1),
            page >= pages,
            "Trang sau",
          )}
          {/* Last */}
          {btn(
            <ChevronsRight size={13} />,
            () => onPageChange(pages),
            page >= pages,
            "Trang cuối",
          )}
        </div>
      )}
    </div>
  );
}
