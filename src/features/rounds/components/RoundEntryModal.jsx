import React, { useState, useRef, useEffect } from 'react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { Modal, Button } from '../../../shared/components';
import { CROCHET_ABBREVIATIONS } from '../../../shared/data/crochetAbbreviations';
import { shouldShowFullText } from '../../../shared/utils/textTransform';
import styles from './RoundEntryModal.module.css';

// Streamlined button list (removed: tr, in, each, punctuation)
const BUTTON_ABBREVIATIONS = [
    'sc', 'hdc', 'dc', 'ch', 'inc', 'dec', 'sc2tog', 'MR', 'st',
    'sl st', 'invdec', 'inv fo', 'change color', 'FLO', 'BLO', 'sts'
];

function RoundEntryModal({ isOpen, onClose, projectId, componentId }) {
    const { state, dispatch } = useProjects();
    const [instruction, setInstruction] = useState('');
    const [error, setError] = useState('');
    const [showFullText, setShowFullText] = useState(false);
    const textareaRef = useRef(null);

    // Find component to get previous stitch count
    const project = state.projects.find(p => p.id === projectId);
    const component = project?.components.find(c => c.id === componentId);
    const previousCount = component && component.rounds.length > 0
        ? component.rounds[component.rounds.length - 1].stitchCount
        : 0;
    const nextRoundNumber = component ? component.rounds.length + 1 : 1;

    const [stitchCount, setStitchCount] = useState(previousCount > 0 ? previousCount.toString() : '');

    // Update stitch count when previousCount changes or modal opens
    useEffect(() => {
        if (isOpen && previousCount > 0) {
            setStitchCount(previousCount.toString());
        }
    }, [isOpen, previousCount]);

    // Check setting when modal opens
    useEffect(() => {
        if (isOpen) {
            setShowFullText(shouldShowFullText());
        }
    }, [isOpen]);

    // Get button label (abbr or full text based on setting)
    const getButtonLabel = (abbr) => {
        const found = CROCHET_ABBREVIATIONS.find(a => a.abbr === abbr);
        if (!found) return abbr;
        return showFullText ? found.full : found.abbr;
    };

    // Get text to insert (always insert what matches the current display mode)
    const getInsertText = (abbr) => {
        const found = CROCHET_ABBREVIATIONS.find(a => a.abbr === abbr);
        if (!found) return abbr;
        return showFullText ? found.full : found.abbr;
    };

    // Insert text at cursor position
    const insertText = (abbr) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const text = getInsertText(abbr);
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = instruction;

        // Add space before if needed
        const needsSpaceBefore = start > 0 && currentValue[start - 1] !== ' ' && currentValue[start - 1] !== '(';
        const prefix = needsSpaceBefore ? ' ' : '';

        // Add space after
        const suffix = ' ';

        const newValue = currentValue.substring(0, start) + prefix + text + suffix + currentValue.substring(end);
        const newCursorPos = start + prefix.length + text.length + suffix.length;

        setInstruction(newValue);
        setError('');

        // Restore cursor position after state updates
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!instruction.trim()) {
            setError('Instruction is required');
            return;
        }

        if (!stitchCount || parseInt(stitchCount) < 0) {
            setError('Valid stitch count is required');
            return;
        }

        dispatch({
            type: ACTIONS.ADD_ROUND,
            payload: {
                projectId,
                componentId,
                instruction: instruction.trim(),
                stitchCount: parseInt(stitchCount)
            }
        });

        // Reset and close
        setInstruction('');
        setStitchCount('');
        setError('');
        onClose();
    };

    const handleClose = () => {
        setInstruction('');
        setStitchCount('');
        setError('');
        onClose();
    };

    // Auto-focus textarea when modal opens
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

                {/* Abbreviation Bar - word cloud style */}
                <div className={styles['abbreviation-bar']}>
                    <div className={styles['abbreviation-buttons-cloud']}>
                        {BUTTON_ABBREVIATIONS.map((abbr) => (
                            <button
                                key={abbr}
                                type="button"
                                className={styles['abbr-btn-cloud']}
                                onClick={() => insertText(abbr)}
                            >
                                {getButtonLabel(abbr)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stitch Count Input with +/- buttons */}
                <div className={styles['form-group']}>
                    <label htmlFor="stitch-count" className={styles['form-label']}>
                        Stitch Count <span className={styles.required}>*</span>
                    </label>
                    <div className={styles['increment-input']}>
                        <button
                            type="button"
                            className={styles['increment-btn-minus']}
                            onClick={() => setStitchCount(Math.max(0, parseInt(stitchCount || 0) - 1).toString())}
                        >
                            −
                        </button>
                        <input
                            id="stitch-count"
                            type="number"
                            className={styles['increment-value']}
                            value={stitchCount}
                            onChange={(e) => {
                                setStitchCount(e.target.value);
                                setError('');
                            }}
                            min="0"
                        />
                        <button
                            type="button"
                            className={styles['increment-btn-plus']}
                            onClick={() => setStitchCount((parseInt(stitchCount || 0) + 1).toString())}
                        >
                            +
                        </button>
                    </div>
                </div>

                {error && (
                    <div className={styles['error-message']}>
                        {error}
                    </div>
                )}

                <div className={styles['modal-actions']}>
                    <Button variant="secondary" onClick={handleClose} type="button">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        Add Round
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default RoundEntryModal;
