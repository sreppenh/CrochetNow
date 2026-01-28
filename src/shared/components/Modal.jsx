import React, { useEffect } from 'react';
import styles from './Modal.module.css';

/**
 * Modal Component
 * Reusable modal with ESC key support and backdrop click to close
 * 
 * Props:
 * - isOpen: boolean - controls visibility
 * - onClose: function - called when modal should close
 * - title: string - modal title
 * - children: ReactNode - modal content
 * - size: 'small' | 'medium' | 'large' - modal width (default: 'medium')
 */
function Modal({ isOpen, onClose, title, children, size = 'medium' }) {
    // Handle ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles['modal-overlay']} onClick={handleBackdropClick}>
            <div className={`${styles.modal} ${styles[`modal-${size}`]}`}>
                <div className={styles['modal-header']}>
                    <h2 className={styles['modal-title']}>{title}</h2>
                    <button 
                        className={styles['modal-close']} 
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                <div className={styles['modal-body']}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
