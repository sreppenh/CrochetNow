import React from 'react';
import styles from './EmptyState.module.css';

/**
 * EmptyState Component
 * Displays when a list is empty
 * 
 * Props:
 * - icon: string - emoji or icon to display
 * - title: string - empty state title
 * - description: string - optional description text
 * - action: ReactNode - optional action button
 */
function EmptyState({ icon = '🧶', title, description, action }) {
    return (
        <div className={styles['empty-state']}>
            <div className={styles['empty-icon']}>{icon}</div>
            <h3 className={styles['empty-title']}>{title}</h3>
            {description && <p className={styles['empty-description']}>{description}</p>}
            {action && <div className={styles['empty-action']}>{action}</div>}
        </div>
    );
}

export default EmptyState;
