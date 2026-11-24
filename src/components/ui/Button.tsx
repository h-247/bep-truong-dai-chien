'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none';

  const sizeStyles = {
    sm: 'min-h-[44px] px-3 py-2 text-sm',
    md: 'min-h-[48px] px-5 py-2.5 text-base',
    lg: 'min-h-[56px] px-6 py-3.5 text-lg font-semibold',
  };

  const variantStyles = {
    primary: 'bg-[#FFFFFF] text-[#000000] hover:bg-[#F3F4F6] active:bg-[#E5E7EB]',
    secondary: 'bg-[#303030] text-[#ECECEC] hover:bg-[#404040] border border-[#3A3A3A] active:bg-[#4A4A4A]',
    danger: 'bg-[#EF4444] text-[#FFFFFF] hover:bg-[#DC2626] active:bg-[#B91C1C]',
    success: 'bg-[#22C55E] text-[#FFFFFF] hover:bg-[#16A34A] active:bg-[#15803D]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
