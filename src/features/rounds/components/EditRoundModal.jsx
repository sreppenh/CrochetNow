import React, { useState, useRef, useEffect } from 'react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { Modal, Button } from '../../../shared/components';
import parseRoundInstruction from '../../../shared/utils/parseRoundInstruction';
import styles from './RoundEntryModal.module.css'; // Reusing the same styles

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

function EditRoundModal({ isOpen, onClose, projectId, componentId, round }) {
    const { dispatch } = useProjects();
    const [instruction, setInstruction] = useState(round?.instruction || '');
    const [error, setError] = useState('');
    const textareaRef = useRef(null);

    // Update instruction when round changes
    useEffect(() => {
        if (round) {
            setInstruction(round.instruction);
        }
    }, [round]);

    // Auto-focus textarea when modal opens
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen]);

    const insertText = (text) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = instruction.substring(0, start);
        const after = instruction.substring(end);

        // Add space before if needed
        const needsSpaceBefore = before.length > 0 && before[before.length - 1] !== ' ' && text !== '(' && text !== ')' && text !== ',';
        const prefix = needsSpaceBefore ? ' ' : '';

        const newInstruction = before + prefix + text + after;
        setInstruction(newInstruction);

        // Move cursor after inserted text
        setTimeout(() => {
            const newPosition = start + prefix.length + text.length;
            textarea.selectionStart = newPosition;
            textarea.selectionEnd = newPosition;
            textarea.focus();
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!instruction.trim()) {
            setError('Please enter an instruction');
            return;
        }

        // Parse instruction to get stitch count
        const parsed = parseRoundInstruction(instruction);

        if (parsed.stitchCount === 0 && !instruction.toLowerCase().includes('join') && !instruction.toLowerCase().includes('fasten')) {
            setError('Could not calculate stitch count. Please check your instruction.');
            return;
        }

        // Dispatch update action
        dispatch({
            type: ACTIONS.UPDATE_ROUND,
            payload: {
                projectId,
                componentId,
                roundId: round.id,
                instruction: instruction.trim(),
                stitchCount: parsed.stitchCount
            }
        });

        // Close modal
        handleClose();
    };

    const handleClose = () => {
        setInstruction(round?.instruction || '');
        setError('');
        onClose();
    };

    // Preview stitch count
    const parsed = parseRoundInstruction(instruction);
    const previewCount = parsed.stitchCount;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Edit Round ${round?.roundNumber}`}
            size="large"
        >
            <form onSubmit={handleSubmit}>
                {/* Instruction Input */}
                <div className={styles['form-group']}>
                    <label htmlFor="instruction" className={styles['form-label']}>
                        Instruction <span className={styles.required}>*</span>
                    </label>
                    <textarea
                        ref={textareaRef}
                        id="instruction"
                        className={styles['form-textarea']}
                        rows={3}
                        placeholder="e.g., (sc, inc) x 6"
                        value={instruction}
                        onChange={(e) => {
                            setInstruction(e.target.value);
                            setError('');
                        }}
                    />
                    <div className={styles['form-hint']}>
                        Type your instruction or use the buttons below
                    </div>
                </div>

                {/* Abbreviation Bar */}
                <div className={styles['abbreviation-bar']}>
                    <div className={styles['abbreviation-label']}>Quick Insert</div>
                    
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
                {instruction.trim() && (
                    <div className={styles['preview-section']}>
                        <div className={styles['preview-label']}>Preview:</div>
                        <div className={styles['preview-content']}>
                            <span className={styles['preview-instruction']}>{instruction}</span>
                            <span className={styles['preview-count']}>
                                {previewCount} {previewCount === 1 ? 'stitch' : 'stitches'}
                            </span>
                        </div>
                    </div>
                )}

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

export default EditRoundModal;
