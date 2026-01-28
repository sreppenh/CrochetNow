import React, { useState, useEffect } from 'react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { Modal, Button } from '../../../shared/components';
import { YARN_COLORS, HOOK_SIZES } from '../../../shared/data/yarnColors';
import styles from './AddComponentModal.module.css'; // Reusing the same styles

function EditComponentModal({ isOpen, onClose, projectId, component }) {
    const { dispatch } = useProjects();
    
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [color, setColor] = useState('');
    const [hook, setHook] = useState('');
    const [error, setError] = useState('');

    // Update form when component changes
    useEffect(() => {
        if (component) {
            setName(component.name);
            setQuantity(component.quantity);
            setColor(component.color);
            setHook(component.hook);
        }
    }, [component]);

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

        if (!color) {
            setError('Please select a color');
            return;
        }

        if (!hook) {
            setError('Please select a hook size');
            return;
        }

        // Dispatch action to update component
        dispatch({
            type: ACTIONS.UPDATE_COMPONENT,
            payload: {
                projectId,
                componentId: component.id,
                name: name.trim(),
                quantity: parseInt(quantity),
                color,
                hook
            }
        });

        // Close modal
        setError('');
        onClose();
    };

    const handleClose = () => {
        if (component) {
            setName(component.name);
            setQuantity(component.quantity);
            setColor(component.color);
            setHook(component.hook);
        }
        setError('');
        onClose();
    };

    const incrementQuantity = () => {
        setQuantity(Math.min(99, quantity + 1));
    };

    const decrementQuantity = () => {
        setQuantity(Math.max(1, quantity - 1));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Edit Component"
            size="medium"
        >
            <form onSubmit={handleSubmit}>
                {/* Component Name */}
                <div className={styles['form-group']}>
                    <label htmlFor="component-name" className={styles['form-label']}>
                        Component Name <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="component-name"
                        type="text"
                        className={styles['form-input']}
                        placeholder="e.g., Head, Body, Arm"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        autoFocus
                    />
                </div>

                {/* Quantity */}
                <div className={styles['form-group']}>
                    <label htmlFor="component-quantity" className={styles['form-label']}>
                        Quantity <span className={styles.required}>*</span>
                    </label>
                    <div className={styles['quantity-input-wrapper']}>
                        <button
                            type="button"
                            className={styles['quantity-button']}
                            onClick={decrementQuantity}
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
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setQuantity(Math.max(1, Math.min(99, val)));
                            }}
                        />
                        <button
                            type="button"
                            className={styles['quantity-button']}
                            onClick={incrementQuantity}
                            disabled={quantity >= 99}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Starting Color */}
                <div className={styles['form-group']}>
                    <label className={styles['form-label']}>
                        Color <span className={styles.required}>*</span>
                    </label>
                    <div className={styles['color-grid']}>
                        {YARN_COLORS.map(colorOption => {
                            const isSelected = color === colorOption.name;
                            return (
                                <button
                                    key={colorOption.name}
                                    type="button"
                                    onClick={() => setColor(colorOption.name)}
                                    className={`${styles['color-button']} ${isSelected ? styles['color-button-selected'] : ''}`}
                                    title={colorOption.name}
                                >
                                    <div 
                                        className={styles['color-circle']}
                                        style={{ backgroundColor: colorOption.hex }}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Selected Color Display */}
                    {color && (
                        <div className={styles['selected-color']}>
                            <div 
                                className={styles['selected-swatch']}
                                style={{ 
                                    backgroundColor: YARN_COLORS.find(c => c.name === color)?.hex 
                                }}
                            />
                            <span>{color}</span>
                        </div>
                    )}
                </div>

                {/* Hook Size */}
                <div className={styles['form-group']}>
                    <label htmlFor="component-hook" className={styles['form-label']}>
                        Hook Size <span className={styles.required}>*</span>
                    </label>
                    <select
                        id="component-hook"
                        className={styles['form-select']}
                        value={hook}
                        onChange={(e) => setHook(e.target.value)}
                    >
                        {HOOK_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className={styles['error-message']}>
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
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
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default EditComponentModal;
