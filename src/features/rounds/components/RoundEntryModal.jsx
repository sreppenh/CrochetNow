import React, { useState, useRef, useEffect } from 'react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { Modal, Button } from '../../../shared/components';
import parseRoundInstruction from '../../../shared/utils/parseRoundInstruction';
import styles from './RoundEntryModal.module.css';

const COMMON_ABBREVIATIONS = [
    { abbr: 'sc', label: 'sc' },
    { abbr: 'hdc', label: 'hdc' },
    { abbr: 'dc', label: 'dc' },
    { abbr: 'ch', label: 'ch' },
    { abbr: 'inc', label: 'inc' },
    { abbr: 'dec', label: 'dec' },
    { abbr: 'MR', label: 'MR' },
    { abbr: 'st', label: 'st' }
];

const ADVANCED_ABBREVIATIONS = [
    { abbr: 'sl st', label: 'sl st' },
    { abbr: 'tr', label: 'tr' },
    { abbr: 'invdec', label: 'invdec' },
    { abbr: 'FLO', label: 'FLO' },
    { abbr: 'BLO', label: 'BLO' },
    { abbr: 'sts', label: 'sts' },
    { abbr: 'in', label: 'in' },
    { abbr: 'each', label: 'each' }
];

const PUNCTUATION = [
    { abbr: '(', label: '(' },
    { abbr: ')', label: ')' },
    { abbr: ',', label: ',' },
    { abbr: ' x ', label: 'x' }
];

function RoundEntryModal({ isOpen, onClose, projectId, componentId }) {
    const { state, dispatch } = useProjects();
    const [instruction, setInstruction] = useState('');
    const [error, setError] = useState('');
    const textareaRef = useRef(null);

    // Find component to get previous stitch count
    const project = state.projects.find(p => p.id === projectId);
    const component = project?.components.find(c => c.id === componentId);
    const previousCount = component && component.rounds.length > 0 
        ? component.rounds[component.rounds.length - 1].stitchCount 
        : 0;
    const nextRoundNumber = component ? component.rounds.length + 1 : 1;

    // Calculate preview stitch count
    const calculatedCount = instruction.trim() 
        ? parseRoundInstruction(instruction, previousCount)
        : null;

    const change = calculatedCount !== null ? calculatedCount - previousCount : null;

    // Insert text at cursor position
    const insertText = (text) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = instruction;

        // Add space before if needed
        const needsSpaceBefore = start > 0 && currentValue[start - 1] !== ' ' && currentValue[start - 1] !== '(';
        const prefix = needsSpaceBefore ? ' ' : '';

        // Add space after if needed (except for punctuation)
        const needsSpaceAfter = !['(', ')', ','].includes(text);
        const suffix = needsSpaceAfter ? ' ' : '';

        const newValue = currentValue.substring(0, start) + prefix + text + suffix + currentValue.substring(end);
        setInstruction(newValue);

        // Set cursor position after inserted text
        setTimeout(() => {
            const newCursorPos = start + prefix.length + text.length + suffix.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
            textarea.focus();
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!instruction.trim()) {
            setError('Please enter a round instruction');
            return;
        }

        if (calculatedCount === null) {
            setError('Could not calculate stitch count from instruction');
            return;
        }

        // Dispatch action to add round
        dispatch({
            type: ACTIONS.ADD_ROUND,
            payload: {
                projectId,
                componentId,
                instruction: instruction.trim(),
                stitchCount: calculatedCount
            }
        });

        // Reset and close
        setInstruction('');
        setError('');
        onClose();
    };

    const handleClose = () => {
        setInstruction('');
        setError('');
        onClose();
    };

    // Focus textarea when modal opens
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Add Round ${nextRoundNumber}`}
            size="medium"
        >
            <form onSubmit={handleSubmit}>
                <div className={styles['form-group']}>
                    <textarea
                        ref={textareaRef}
                        id="round-instruction"
                        className={styles['form-input']}
                        rows="3"
                        placeholder="e.g., 6 sc in MR or (sc, inc) x 6"
                        value={instruction}
                        onChange={(e) => {
                            setInstruction(e.target.value);
                            setError('');
                        }}
                    />
                </div>

                {/* Abbreviation Bar - moved directly under textarea */}
                <div className={styles['abbreviation-bar']}>
                    
                    {/* Common Abbreviations */}
                    <div className={styles['abbreviation-buttons']}>
                        {COMMON_ABBREVIATIONS.map(({ abbr, label }) => (
                            <button
                                key={abbr}
                                type="button"
                                className={styles['abbr-btn']}
                                onClick={() => insertText(abbr)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    
                    {/* Advanced Abbreviations */}
                    <div className={styles['abbreviation-buttons']}>
                        {ADVANCED_ABBREVIATIONS.map(({ abbr, label }) => (
                            <button
                                key={abbr}
                                type="button"
                                className={styles['abbr-btn']}
                                onClick={() => insertText(abbr)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    
                    {/* Punctuation */}
                    <div className={styles['punctuation-buttons']}>
                        {PUNCTUATION.map(({ abbr, label }) => (
                            <button
                                key={abbr}
                                type="button"
                                className={styles['punct-btn']}
                                onClick={() => insertText(abbr)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                {calculatedCount !== null && (
                    <div className={styles['preview-box']}>
                        <div className={styles['preview-label']}>Calculated Stitch Count</div>
                        <div className={styles['preview-content']}>
                            This round will have <span className={styles['preview-stitch']}>{calculatedCount}</span> stitches
                            {change !== null && previousCount > 0 && (
                                <span className={styles['stitch-change']} style={{
                                    color: change > 0 ? '#1E40AF' : change < 0 ? '#DC2626' : 'var(--warm-600)'
                                }}>
                                    {change > 0 ? ` (+${change})` : change < 0 ? ` (${change})` : ' (no change)'}
                                </span>
                            )}
                        </div>
                    </div>
                )}

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
                        Add Round
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default RoundEntryModal;
