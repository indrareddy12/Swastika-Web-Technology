import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const visiblePages = getPages();

  return (
    <div className={`flex items-center justify-between px-2 py-4 ${className}`}>
      {/* Summary label */}
      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
        Page {currentPage} of {totalPages}
      </span>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {visiblePages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange && onPageChange(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150
              ${p === currentPage
                ? 'bg-brand-600 border-brand-600 text-white shadow-sm shadow-brand-500/10'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60'
              }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
