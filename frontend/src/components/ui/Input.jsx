import React from 'react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  error,
  placeholder = '',
  className = '',
  id,
  required = false,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        id={inputId}
        placeholder={placeholder}
        className={`px-3.5 py-2 w-full text-sm rounded-lg border transition-all duration-150
          ${error 
            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500 dark:border-red-500/60' 
            : 'border-slate-200 focus:ring-brand-500/25 focus:border-brand-500 dark:border-slate-800'
          }
          bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2`}
        required={required}
        {...props}
      />
      
      {error && (
        <span className="text-xs font-medium text-red-500 animate-slide-in">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
