import React, { useState } from 'react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { Modal, Button } from '../../../shared/components';
import styles from './ComponentCreationModal.module.css';

function ComponentCreationModal({ isOpen, onClose, projectId }) {
    const { dispatch } = useProjects();
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!name.trim()) {
            setError('Please enter a component name');
            return;
        }

        if (quantity < 1) {
            setError('Quantity must be at least 1');
            return;
        }

        // Dispatch action to add component
        dispatch({
            type: ACTIONS.ADD_COMPONENT,
            payload: {
                projectId,
                name: name.trim(),
                quantity: parseInt(quantity)
            }
        });

        // Reset form and close
        setName('');
        setQuantity(1);
        setError('');
        onClose();
    };

    const handleClose = () => {
        setName('');
        setQuantity(1);
        setError('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Component"
            size="small"
        >
            <form onSubmit={handleSubmit}>
                <div className={styles['form-group']}>
                    <label htmlFor="component-name" className={styles['form-label']}>
                        Component Name
                    </label>
                    <input
                        id="component-name"
                        type="text"
                        className={styles['form-input']}
                        placeholder="e.g., Head, Arm, Leg"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        autoFocus
                    />
                    <div className={styles['form-hint']}>
                        What body part are you making?
                    </div>
                </div>

                <div className={styles['form-group']}>
                    <label htmlFor="component-quantity" className={styles['form-label']}>
                        Quantity
                    </label>
                    <div className={styles['quantity-input-wrapper']}>
                        <button
                            type="button"
                            className={styles['quantity-button']}
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            −
                        </button>
                        <input
                            id="component-quantity"
                            type="number"
                            className={styles['quantity-input']}
                            min="1"
                            max="99"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        />
                        <button
                            type="button"
                            className={styles['quantity-button']}
                            onClick={() => setQuantity(Math.min(99, quantity + 1))}
                            disabled={quantity >= 99}
                        >
                            +
                        </button>
                    </div>
                    <div className={styles['form-hint']}>
                        How many of this component do you need to make?
                    </div>
                </div>

                {error && (
                    <div className={styles['error-message']}>
                        {error}
                    </div>
                )}

                <div className={styles['modal-actions']}>
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                    >
                        Add Component
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default ComponentCreationModal;
