import { useState, useRef, useEffect } from 'react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { Modal, Button } from '../../../shared/components';
import { CROCHET_ABBREVIATIONS } from '../../../shared/data/crochetAbbreviations';
import { shouldShowFullText } from '../../../shared/utils/textTransform';
import styles from './RoundEntryModal.module.css'; // Reusing the same styles

// Streamlined button list (removed: tr, in, each, punctuation)
const BUTTON_ABBREVIATIONS = [
    'sc', 'hdc', 'dc', 'ch', 'inc', 'dec', 'MR', 'st',
    'sl st', 'invdec', 'inv fo', 'change color', 'FLO', 'BLO', 'sts'
];

function EditRoundModal({ isOpen, onClose, projectId, componentId, round }) {
    const { dispatch } = useProjects();
    const [instruction, setInstruction] = useState(round?.instruction || '');
    const [stitchCount, setStitchCount] = useState(round?.stitchCount?.toString() || '');
    const [error, setError] = useState('');
    const [showFullText, setShowFullText] = useState(false);
    const textareaRef = useRef(null);

    // Update instruction and stitch count when round changes
    useEffect(() => {
        if (round) {
            setInstruction(round.instruction);
            setStitchCount(round.stitchCount?.toString() || '');
        }
    }, [round]);

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

    const insertText = (abbr) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const text = getInsertText(abbr);
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = instruction.substring(0, start);
        const after = instruction.substring(end);

        // Add space before if needed
        const needsSpaceBefore = before.length > 0 && before[before.length - 1] !== ' ' && before[before.length - 1] !== '(';
        const prefix = needsSpaceBefore ? ' ' : '';

        // Add space after
        const suffix = ' ';

        const newValue = before + prefix + text + suffix + after;
        const newCursorPos = start + prefix.length + text.length + suffix.length;

        setInstruction(newValue);
        setError('');

        // Restore cursor position
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
            type: ACTIONS.UPDATE_ROUND,
            payload: {
                projectId,
                componentId,
                roundId: round.id,
                instruction: instruction.trim(),
                stitchCount: parseInt(stitchCount)
            }
        });

        setError('');
        onClose();
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    if (!round) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Edit Round ${round.roundNumber}`}
        >
            <form onSubmit={handleSubmit}>
                <div className={styles['form-group']}>
                    <textarea
                        ref={textareaRef}
                        id="instruction"
                        className={styles['form-input']}
                        rows={3}
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

                {/* Stitch Count Input */}
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
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default EditRoundModal;
