import React from 'react';

const Select = React.forwardRef(({
  label,
  options = [], // [{ value: 'xxx', label: 'xxx' }, ...] or ['xxx', 'yyy']
  error,
  className = '',
  id,
  required = false,
  placeholder,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  const normalizedOptions = options.map(opt => 
    typeof opt === 'object' ? opt : { value: opt, label: opt }
  );

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        className={`px-3.5 py-2 w-full text-sm rounded-lg border transition-all duration-150 appearance-none bg-no-repeat
          ${error
            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500 dark:border-red-500/60'
            : 'border-slate-200 focus:ring-brand-500/25 focus:border-brand-500 dark:border-slate-800'
          }
          bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2`}
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.25rem'
        }}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <span className="text-xs font-medium text-red-500 animate-slide-in">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
