import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary, secondary, danger, outline, ghost
  size = 'md',        // sm, md, lg
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow shadow-brand-500/20 focus:ring-brand-500 dark:focus:ring-offset-slate-900',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 focus:ring-slate-500 dark:focus:ring-offset-slate-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow shadow-red-500/20 focus:ring-red-500 dark:focus:ring-offset-slate-900',
    outline: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900 focus:ring-brand-500 dark:focus:ring-offset-slate-900',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 focus:ring-brand-500 dark:focus:ring-offset-slate-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && <Icon className="mr-2 h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
