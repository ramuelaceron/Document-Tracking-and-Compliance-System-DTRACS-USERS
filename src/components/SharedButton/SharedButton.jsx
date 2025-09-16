// src/components/SharedButton/SharedButton.jsx
import React from 'react';
import './SharedButton.css';

const SharedButton = ({ 
  children, 
  variant = 'default', 
  size = 'medium', 
  onClick, 
  disabled, 
  type = 'button', 
  fullWidth = false,
  as = 'button',
  ...rest 
}) => {
  const Component = as;

  const handleClick = (e) => {
    console.log('🔍 SharedButton clicked!', { onClick, disabled });
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Component
      type={as === 'button' ? type : undefined}
      className={`shared-button shared-button--${variant} shared-button--${size}`}
      onClick={handleClick} // 👈 Use our custom handler
      disabled={disabled}
      style={{ 
        width: fullWidth ? '100%' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default SharedButton;