import React from 'react';

const Alert = ({ 
  children, 
  className = '',
  variant = 'default',
  ...props 
}) => {
  const baseClasses = 'relative w-full rounded-lg border p-4';
  
  const variantClasses = {
    default: 'bg-white border-gray-200',
    destructive: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-green-200 bg-green-50 text-green-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDescription = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`text-sm [&_p]:leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertTitle = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <h5 
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
};

export { Alert, AlertDescription, AlertTitle }; 