import React from 'react';
import styles from './Button.module.css';

/**
 * Button Component
 * Standardized button with variants
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'tertiary' - button style
 * - onClick: function - click handler
 * - disabled: boolean - disabled state
 * - fullWidth: boolean - take full width of container
 * - type: 'button' | 'submit' - button type (default: 'button')
 * - children: ReactNode - button content
 */
function Button({ 
    variant = 'primary', 
    onClick, 
    disabled = false,
    fullWidth = false,
    type = 'button',
    children 
}) {
    const className = [
        styles.btn,
        styles[`btn-${variant}`],
        fullWidth ? styles['btn-full-width'] : ''
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={className}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

export default Button;
