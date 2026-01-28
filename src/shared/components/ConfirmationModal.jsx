import React from 'react';
import { Modal, Button } from '../components';
import styles from './ConfirmationModal.module.css';

/**
 * ConfirmationModal Component
 * Reusable modal for confirmations (delete, etc.)
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onConfirm: function
 * - title: string
 * - message: string
 * - confirmText: string (default: "Confirm")
 * - cancelText: string (default: "Cancel")
 * - variant: 'danger' | 'warning' | 'info' (default: 'warning')
 */
function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning'
}) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="small"
        >
            <div className={styles['confirmation-content']}>
                <p className={styles['confirmation-message']}>{message}</p>

                <div className={styles['confirmation-actions']}>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        fullWidth
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'primary' : 'primary'}
                        onClick={handleConfirm}
                        fullWidth
                        className={variant === 'danger' ? styles['button-danger'] : ''}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmationModal;
