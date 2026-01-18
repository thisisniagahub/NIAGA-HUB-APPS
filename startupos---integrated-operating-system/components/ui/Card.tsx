import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action, ...props }) => {
  return (
    <div className={`bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-sm ${className}`} {...props}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};