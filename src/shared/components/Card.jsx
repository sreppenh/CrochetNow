import React from 'react';
import styles from './Card.module.css';

/**
 * Card Component
 * Reusable card container for projects, components, and rounds
 * 
 * Props:
 * - variant: 'default' | 'interactive' | 'info' - card style
 * - onClick: function - optional click handler (makes card interactive)
 * - children: ReactNode - card content
 * - className: string - additional CSS classes
 */
function Card({ variant = 'default', onClick, children, className = '' }) {
    const isInteractive = !!onClick || variant === 'interactive';
    const cardClassName = [
        styles.card,
        styles[`card-${variant}`],
        isInteractive ? styles['card-clickable'] : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div 
            className={cardClassName}
            onClick={onClick}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onKeyDown={isInteractive ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(e);
                }
            } : undefined}
        >
            {children}
        </div>
    );
}

export default Card;
