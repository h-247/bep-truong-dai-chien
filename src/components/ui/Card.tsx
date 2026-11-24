import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const padStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={`bg-[#262626] border border-[#3A3A3A] rounded-2xl shadow-lg ${padStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
