import React, { useState } from 'react';
import { Modal, Button } from '../../../shared/components';
import { YARN_COLORS, HOOK_SIZES } from '../../../shared/data/yarnColors';
import styles from './CreateProjectModal.module.css';

function CreateProjectModal({ isOpen, onClose, onCreateAndAddComponent }) {
    const [name, setName] = useState('');
    const [defaultHook, setDefaultHook] = useState('3.5mm (E/4)');
    const [defaultColor, setDefaultColor] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!name.trim()) {
            setError('Please enter a project name');
            return;
        }

        if (!defaultHook) {
            setError('Please select a hook size');
            return;
        }

        // Create project data
        const projectData = {
            name: name.trim(),
            defaultHook,
            defaultColor: defaultColor || null
        };

        // Reset form
        setName('');
        setDefaultHook('3.5mm (E/4)');
        setDefaultColor('');
        setError('');

        // Call parent handler
        onCreateAndAddComponent(projectData);
    };

    const handleClose = () => {
        setName('');
        setDefaultHook('3.5mm (E/4)');
        setDefaultColor('');
        setError('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create Project"
            size="small"
        >
            <form onSubmit={handleSubmit}>
                {/* Project Name */}
                <div className={styles['form-group']}>
                    <label htmlFor="project-name" className={styles['form-label']}>
                        Project Name <span className={styles.required}>*</span>
                    </label>
                    <input
                        id="project-name"
                        type="text"
                        className={styles['form-input']}
                        placeholder="e.g., Bunny Amigurumi"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                        }}
                        autoFocus
                    />
                </div>

                {/* Default Hook Size */}
                <div className={styles['form-group']}>
                    <label htmlFor="default-hook" className={styles['form-label']}>
                        Default Hook Size <span className={styles.required}>*</span>
                    </label>
                    <select
                        id="default-hook"
                        className={styles['form-select']}
                        value={defaultHook}
                        onChange={(e) => setDefaultHook(e.target.value)}
                    >
                        {HOOK_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                {/* Default Color (Optional) */}
                <div className={styles['form-group']}>
                    <label className={styles['form-label']}>
                        Default Color <span className={styles.optional}>(optional)</span>
                    </label>
                    <div className={styles['color-grid']}>
                        {YARN_COLORS.map(color => {
                            const isSelected = defaultColor === color.name;
                            return (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setDefaultColor(color.name)}
                                    className={`${styles['color-button']} ${isSelected ? styles['color-button-selected'] : ''}`}
                                    title={color.name}
                                >
                                    <div 
                                        className={styles['color-circle']}
                                        style={{ backgroundColor: color.hex }}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Selected Color Display */}
                    {defaultColor && (
                        <div className={styles['selected-color']}>
                            <div 
                                className={styles['selected-swatch']}
                                style={{ 
                                    backgroundColor: YARN_COLORS.find(c => c.name === defaultColor)?.hex 
                                }}
                            />
                            <span>{defaultColor}</span>
                        </div>
                    )}
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
                        Add Component →
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default CreateProjectModal;
