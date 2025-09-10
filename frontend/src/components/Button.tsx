import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className = '' 
}) => {
  const baseClasses = 'px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-brand-primary hover:bg-brand-secondary text-white focus:ring-brand-primary',
    secondary: 'bg-brand-accent hover:bg-brand-secondary text-white focus:ring-brand-accent'
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${(disabled || loading) ? disabledClasses : ''} 
        ${className}
      `}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
