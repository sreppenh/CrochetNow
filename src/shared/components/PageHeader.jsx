import React from 'react';
import styles from './PageHeader.module.css';

/**
 * PageHeader Component
 * Navigation header with optional back button and title
 * 
 * Props:
 * - title: string - page title
 * - subtitle: string - optional subtitle
 * - onBack: function - optional back button handler
 * - actions: ReactNode - optional action buttons on right side
 */
function PageHeader({ title, subtitle, onBack, actions }) {
    return (
        <div className={styles['page-header']}>
            <div className={styles['page-header-content']}>
                {onBack && (
                    <button 
                        className={styles['back-button']} 
                        onClick={onBack}
                        aria-label="Go back"
                    >
                        ←
                    </button>
                )}
                <div className={styles['page-header-text']}>
                    <h1 className={styles['page-title']}>{title}</h1>
                    {subtitle && <p className={styles['page-subtitle']}>{subtitle}</p>}
                </div>
                {actions && (
                    <div className={styles['page-header-actions']}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PageHeader;
