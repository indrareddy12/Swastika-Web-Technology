import React from 'react';

const Table = ({
  headers = [], // ['Title', 'Assignee', ...] or [{ key: 'xxx', label: 'xxx', sortable: true }]
  loading = false,
  emptyMessage = "No records found.",
  children,
  onSort,
  currentSort = { by: '', order: '' },
}) => {
  const handleSortClick = (key) => {
    if (!onSort) return;
    let order = 'asc';
    if (currentSort.by === key && currentSort.order === 'asc') {
      order = 'desc';
    }
    onSort(key, order);
  };

  return (
    <div className="w-full overflow-hidden border border-slate-200/50 dark:border-slate-800/80 rounded-xl bg-white dark:bg-slate-900/40">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-900/80">
              {headers.map((h, i) => {
                const isObj = typeof h === 'object';
                const label = isObj ? h.label : h;
                const sortable = isObj ? h.sortable : false;
                const key = isObj ? h.key : '';
                const isSorted = currentSort.by === key;

                return (
                  <th
                    key={i}
                    onClick={() => sortable && handleSortClick(key)}
                    className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500
                      ${sortable ? 'cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {label}
                      {sortable && (
                        <span className="flex flex-col text-[10px] leading-[6px]">
                          <span className={`${isSorted && currentSort.order === 'asc' ? 'text-brand-500' : 'text-slate-300 dark:text-slate-700'}`}>▲</span>
                          <span className={`${isSorted && currentSort.order === 'desc' ? 'text-brand-500' : 'text-slate-300 dark:text-slate-700'}`}>▼</span>
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm text-slate-600 dark:text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs font-medium text-slate-400">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : React.Children.count(children) === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-5 py-12 text-center text-slate-400 dark:text-slate-600">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
