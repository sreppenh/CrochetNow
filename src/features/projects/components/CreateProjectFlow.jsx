import React, { useState } from 'react';
import { Modal, Button } from '../../../shared/components';
import { YARN_COLORS, HOOK_SIZES } from '../../../shared/data/yarnColors';
import styles from './CreateProjectFlow.module.css';

/**
 * Multi-step modal for creating a project and adding the first component
 * Step 1: Project details (name, default hook, optional color)
 * Step 2: First component details (name, quantity, color, hook)
 */
function CreateProjectFlow({ isOpen, onClose, onComplete }) {
    const [step, setStep] = useState(1);
    
    // Step 1: Project data
    const [projectName, setProjectName] = useState('');
    const [projectHook, setProjectHook] = useState('3.5mm (E/4)');
    const [projectColor, setProjectColor] = useState('');
    
    // Step 2: Component data
    const [componentName, setComponentName] = useState('');
    const [componentQuantity, setComponentQuantity] = useState(1);
    const [componentColor, setComponentColor] = useState('');
    const [componentHook, setComponentHook] = useState('');

    const [error, setError] = useState('');

    // Reset everything when modal closes
    const handleClose = () => {
        setStep(1);
        setProjectName('');
        setProjectHook('3.5mm (E/4)');
        setProjectColor('');
        setComponentName('');
        setComponentQuantity(1);
        setComponentColor('');
        setComponentHook('');
        setError('');
        onClose();
    };

    // Step 1: Validate and move to step 2
    const handleNextStep = (e) => {
        e.preventDefault();
        
        if (!projectName.trim()) {
            setError('Please enter a project name');
            return;
        }

        if (!projectHook) {
            setError('Please select a hook size');
            return;
        }

        setError('');
        
        // Pre-fill component defaults from project
        if (!componentColor) {
            setComponentColor(projectColor || YARN_COLORS[0].name);
        }
        if (!componentHook) {
            setComponentHook(projectHook);
        }
        
        setStep(2);
        
        // Scroll modal to top
        setTimeout(() => {
            const modal = document.querySelector('.modal');
            if (modal) {
                modal.scrollTop = 0;
            }
        }, 50);
    };

    // Step 2: Validate and complete
    const handleComplete = (e) => {
        e.preventDefault();
        
        if (!componentName.trim()) {
            setError('Please enter a component name');
            return;
        }

        if (!componentColor) {
            setError('Please select a color');
            return;
        }

        if (!componentHook) {
            setError('Please select a hook size');
            return;
        }

        setError('');

        // Call parent with both project and component data
        onComplete({
            project: {
                name: projectName.trim(),
                defaultHook: projectHook,
                defaultColor: projectColor || null
            },
            component: {
                name: componentName.trim(),
                quantity: componentQuantity,
                color: componentColor,
                hook: componentHook
            }
        });

        // Reset after completion
        handleClose();
    };

    const handleBack = () => {
        setError('');
        setStep(1);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title={step === 1 ? "Create Project" : "Add First Component"}
            size="medium"
        >
            {/* Subtitle */}
            <p className={styles.subtitle}>
                {step === 1 ? "Step 1 of 2: Project details" : "Step 2 of 2: Component details"}
            </p>

            {/* Step 1: Project Details */}
            {step === 1 && (
                <form onSubmit={handleNextStep}>
                        {error && <div className={styles.error}>{error}</div>}

                        {/* Project Name */}
                        <div className={styles['form-group']}>
                            <label className={styles['form-label']}>
                                Project Name <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                className={styles['form-input']}
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g., Baby Bunny"
                                autoFocus
                            />
                        </div>

                        {/* Default Hook */}
                        <div className={styles['form-group']}>
                            <label className={styles['form-label']}>
                                Default Hook Size <span className={styles.required}>*</span>
                            </label>
                            <select
                                className={styles['form-select']}
                                value={projectHook}
                                onChange={(e) => setProjectHook(e.target.value)}
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
                                {YARN_COLORS.map(color => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        className={`${styles['color-button']} ${projectColor === color.name ? styles['color-button-selected'] : ''}`}
                                        onClick={() => setProjectColor(color.name)}
                                    >
                                        <div
                                            className={styles['color-circle']}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                        />
                                    </button>
                                ))}
                            </div>
                            {projectColor && (
                                <div className={styles['selected-color']}>
                                    <div
                                        className={styles['selected-swatch']}
                                        style={{ backgroundColor: YARN_COLORS.find(c => c.name === projectColor)?.hex }}
                                    />
                                    <span>{projectColor}</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.actions}>
                            <Button type="button" variant="tertiary" onClick={handleClose} fullWidth={false}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" fullWidth={false}>
                                Add Component
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 2: First Component */}
                {step === 2 && (
                    <form onSubmit={handleComplete}>
                        {error && <div className={styles.error}>{error}</div>}

                        {/* Component Name */}
                        <div className={styles['form-group']}>
                            <label className={styles['form-label']}>
                                Component Name <span className={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                className={styles['form-input']}
                                value={componentName}
                                onChange={(e) => setComponentName(e.target.value)}
                                placeholder="e.g., Head, Body, Ear"
                                autoFocus
                            />
                        </div>

                        {/* Quantity */}
                        <div className={styles['form-group']}>
                            <label className={styles['form-label']}>
                                How many? <span className={styles.required}>*</span>
                            </label>
                            <div className={styles['quantity-input']}>
                                <button
                                    type="button"
                                    className={styles['quantity-button']}
                                    onClick={() => setComponentQuantity(Math.max(1, componentQuantity - 1))}
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    className={styles['quantity-value']}
                                    value={componentQuantity}
                                    onChange={(e) => setComponentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    max="99"
                                />
                                <button
                                    type="button"
                                    className={styles['quantity-button']}
                                    onClick={() => setComponentQuantity(Math.min(99, componentQuantity + 1))}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Color */}
                        <div className={styles['form-group']}>
                            <label className={styles['form-label']}>
                                Color <span className={styles.required}>*</span>
                            </label>
                            <div className={styles['color-grid']}>
                                {YARN_COLORS.map(color => (
                                    <button
                                        key={color.name}
                                        type="button"
                                        className={`${styles['color-button']} ${componentColor === color.name ? styles['color-button-selected'] : ''}`}
                                        onClick={() => setComponentColor(color.name)}
                                    >
                                        <div
                                            className={styles['color-circle']}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                        />
                                    </button>
                                ))}
                            </div>
                            {componentColor && (
                                <div className={styles['selected-color']}>
                                    <div
                                        className={styles['selected-swatch']}
                                        style={{ backgroundColor: YARN_COLORS.find(c => c.name === componentColor)?.hex }}
                                    />
                                    <span>{componentColor}</span>
                                </div>
                            )}
                        </div>

                        {/* Hook Size */}
                        <div className={styles['form-group']}>
                            <label className={styles['form-label']}>
                                Hook Size <span className={styles.required}>*</span>
                            </label>
                            <select
                                className={styles['form-select']}
                                value={componentHook}
                                onChange={(e) => setComponentHook(e.target.value)}
                            >
                                {HOOK_SIZES.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.actions}>
                            <Button type="button" variant="tertiary" onClick={handleBack} fullWidth={false}>
                                ← Back
                            </Button>
                            <Button type="submit" variant="primary" fullWidth={false}>
                                Add Component
                            </Button>
                        </div>
                    </form>
                )}
        </Modal>
    );
}

export default CreateProjectFlow;
