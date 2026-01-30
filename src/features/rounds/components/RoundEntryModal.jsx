import { useState, useRef, useEffect } from 'react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { Modal, Button } from '../../../shared/components';
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
    const [stitchCount, setStitchCount] = useState('');
    const [error, setError] = useState('');
    const textareaRef = useRef(null);

    // Find component to get previous stitch count
    const project = state.projects.find(p => p.id === projectId);
    const component = project?.components.find(c => c.id === componentId);
    const previousCount = component && component.rounds.length > 0
        ? component.rounds[component.rounds.length - 1].stitchCount
        : 0;
    const nextRoundNumber = component ? component.rounds.length + 1 : 1;

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

        const count = parseInt(stitchCount);
        if (!stitchCount || isNaN(count) || count < 0) {
            setError('Please enter a valid stitch count');
            return;
        }

        // Dispatch action to add round
        dispatch({
            type: ACTIONS.ADD_ROUND,
            payload: {
                projectId,
                componentId,
                instruction: instruction.trim(),
                stitchCount: count
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
                    {previousCount > 0 && (
                        <div className={styles['form-hint']}>
                            Previous round: {previousCount} stitches
                        </div>
                    )}
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
                        Add Round
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default RoundEntryModal;
