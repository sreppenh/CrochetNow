import React, { useState, useRef, useEffect } from 'react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { Modal, Button } from '../../../shared/components';
import { CROCHET_ABBREVIATIONS } from '../../../shared/data/crochetAbbreviations';
import { shouldShowFullText } from '../../../shared/utils/textTransform';
import styles from './RoundEntryModal.module.css';

// Streamlined button list with sc2tog added
const BUTTON_ABBREVIATIONS = [
    'sc', 'hdc', 'dc', 'ch', 'inc', 'dec', 'sc2tog', 'MR', 'st',
    'sl st', 'invdec', 'inv fo', 'change color', 'FLO', 'BLO', 'sts'
];

function RoundEntryModal({ isOpen, onClose, projectId, componentId, previousStitchCount = 0 }) {
    const { dispatch } = useProjects();
    const [instruction, setInstruction] = useState('');
    const [stitchCount, setStitchCount] = useState('');
    const [error, setError] = useState('');
    const [showFullText, setShowFullText] = useState(false);
    const textareaRef = useRef(null);

    // Auto-focus textarea when modal opens
    useEffect(() => {
        if (isOpen && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isOpen]);

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
    const insertText = (text) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = instruction;

        // Insert text with proper spacing
        const beforeCursor = currentValue.substring(0, start);
        const afterCursor = currentValue.substring(end);
        
        // Add space before if needed (not at start and prev char isn't space)
        const needsSpaceBefore = start > 0 && beforeCursor.charAt(start - 1) !== ' ';
        // Add space after if there's text after and it's not a space or punctuation
        const needsSpaceAfter = afterCursor.length > 0 && 
                               !/^[\s,)x]/.test(afterCursor);

        const textToInsert = (needsSpaceBefore ? ' ' : '') + 
                            getInsertText(text) + 
                            (needsSpaceAfter ? ' ' : '');

        const newValue = beforeCursor + textToInsert + afterCursor;
        const newCursorPos = start + textToInsert.length;

        setInstruction(newValue);
        setError('');

        // Set cursor position after text insertion
        setTimeout(() => {
            textarea.selectionStart = newCursorPos;
            textarea.selectionEnd = newCursorPos;
            textarea.focus();
        }, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!instruction.trim()) {
            setError('Please enter an instruction');
            return;
        }

        if (!stitchCount || parseInt(stitchCount) < 0) {
            setError('Please enter a valid stitch count');
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

        handleClose();
    };

    const handleClose = () => {
        setInstruction('');
        setStitchCount('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Round">
            <form onSubmit={handleSubmit}>
                <div className={styles['form-group']}>
                    <label htmlFor="round-instruction" className={styles['form-label']}>
                        Instruction <span className={styles.required}>*</span>
                    </label>
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
