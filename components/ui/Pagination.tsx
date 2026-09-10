import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  itemName = 'items',
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) {
    if (totalItems === 0) return null;
    return (
      <div
        className={`flex items-center justify-between px-4 py-3 bg-[#eae9e9] border-t-2 border-ink/40 text-xs font-mono text-slateText-secondary ${className}`}
      >
        <span>
          Showing <b>{totalItems}</b> of <b>{totalItems}</b> {itemName}
        </span>
        <span className="px-2 py-0.5 bg-white border border-ink/20 text-ink font-bold">
          Page 1 of 1
        </span>
      </div>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[#eae9e9] border-t-2 border-ink/40 text-xs font-mono ${className}`}
    >
      {/* Range readout */}
      <div className="text-slateText-secondary text-[11px] sm:text-xs">
        Showing <b className="text-ink">{startItem}</b>–<b className="text-ink">{endItem}</b> of{' '}
        <b className="text-ink">{totalItems}</b> {itemName}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center gap-1">
        {/* First page button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-7 h-7 flex items-center justify-center bg-white border border-ink/40 text-ink hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink disabled:cursor-not-allowed transition-colors"
          title="First Page"
        >
          <ChevronsLeft size={13} />
        </button>

        {/* Previous page button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-7 px-2 flex items-center gap-1 bg-white border border-ink/40 text-ink font-bold hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <ChevronLeft size={13} />
          <span className="hidden sm:inline text-[11px]">Prev</span>
        </button>

        {/* Numbered pages */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-slateText-muted select-none">
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 text-xs font-bold transition-colors border ${
                  isActive
                    ? 'bg-ink text-white border-ink font-black shadow-xs'
                    : 'bg-white text-ink border-ink/40 hover:bg-[#eae9e9]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-7 px-2 flex items-center gap-1 bg-white border border-ink/40 text-ink font-bold hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <span className="hidden sm:inline text-[11px]">Next</span>
          <ChevronRight size={13} />
        </button>

        {/* Last page button */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-7 h-7 flex items-center justify-center bg-white border border-ink/40 text-ink hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-ink disabled:cursor-not-allowed transition-colors"
          title="Last Page"
        >
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
}
