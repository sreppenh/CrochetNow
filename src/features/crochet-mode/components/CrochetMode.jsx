import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RotateCcw, Check } from 'lucide-react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { YARN_COLORS } from '../../../shared/data/yarnColors';
import { CROCHET_ABBREVIATIONS } from '../../../shared/data/crochetAbbreviations';
import { displayText } from '../../../shared/utils/textTransform';
import styles from './CrochetMode.module.css';

function CrochetMode() {
    const { projectId, componentId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useProjects();

    const [showAbbreviationHelp, setShowAbbreviationHelp] = useState(null);
    const [showContinueDialog, setShowContinueDialog] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Find project and component
    const project = state.projects.find(p => p.id === projectId);
    const component = project?.components.find(c => c.id === componentId);
    const rounds = component?.rounds || [];

    // Use currentRound from component state (like IntelliKnit's currentStep)
    const currentRoundIndex = component?.currentRound ?? 0;
    const currentRound = rounds[currentRoundIndex];

    // Update currentRound in state when it changes
    const updateCurrentRound = useCallback((newIndex) => {
        dispatch({
            type: ACTIONS.UPDATE_CURRENT_ROUND,
            payload: {
                projectId,
                componentId,
                currentRound: newIndex
            }
        });
    }, [dispatch, projectId, componentId]);

    // Navigation - defined before early return
    const canGoLeft = currentRoundIndex > 0;
    const canGoRight = currentRoundIndex < rounds.length - 1;

    const navigateLeft = useCallback(() => {
        if (canGoLeft) {
            updateCurrentRound(currentRoundIndex - 1);
        }
    }, [canGoLeft, currentRoundIndex, updateCurrentRound]);

    const navigateRight = useCallback(() => {
        if (canGoRight) {
            updateCurrentRound(currentRoundIndex + 1);
        }
    }, [canGoRight, currentRoundIndex, updateCurrentRound]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') navigateLeft();
            if (e.key === 'ArrowRight') navigateRight();
            if (e.key === 'Escape') navigate(`/project/${projectId}`);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigateLeft, navigateRight, navigate, projectId]);

    // Redirect if not found
    useEffect(() => {
        if (!project || !component || rounds.length === 0) {
            navigate(`/project/${projectId}/component/${componentId}`);
        }
    }, [project, component, rounds.length, projectId, componentId, navigate]);

    // Early return AFTER all hooks
    if (!project || !component || rounds.length === 0) {
        return null;
    }

    // Helper functions
    const getColorHex = (colorName) => {
        return YARN_COLORS.find(c => c.name === colorName)?.hex || '#cccccc';
    };

    // Checkmark = complete round and move to next (like IntelliKnit)
    const handleCompleteRound = () => {
        if (currentRoundIndex < rounds.length - 1) {
            // Move to next round
            updateCurrentRound(currentRoundIndex + 1);
        } else {
            // Last round completed - increment component completion
            dispatch({
                type: ACTIONS.INCREMENT_COMPONENT_COMPLETION,
                payload: {
                    projectId,
                    componentId
                }
            });

            // Check if there are more to make
            if (component.completedCount + 1 < component.quantity) {
                // More to make - show continue dialog
                setShowContinueDialog(true);
            } else {
                // All done!
                alert(`All ${component.quantity} ${component.name}${component.quantity > 1 ? 's' : ''} complete! 🎉`);
                navigate(`/project/${projectId}`);
            }
        }
    };

    const handleContinueNext = () => {
        // Reset to first round and close dialog
        updateCurrentRound(0);
        setShowContinueDialog(false);
    };

    const handleStopCrocheting = () => {
        // Go back to project view
        setShowContinueDialog(false);
        navigate(`/project/${projectId}`);
    };

    const handleUndo = () => {
        if (currentRoundIndex > 0) {
            updateCurrentRound(currentRoundIndex - 1);
        }
    };

    // Touch handlers
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && canGoRight) {
            navigateRight();
        }
        if (isRightSwipe && canGoLeft) {
            navigateLeft();
        }
    };

    // Check if color or hook changed
    const hasColorChange = currentRoundIndex > 0 &&
        currentRound &&
        rounds[currentRoundIndex - 1] &&
        currentRound.color !== rounds[currentRoundIndex - 1].color;

    const hasHookChange = currentRoundIndex > 0 &&
        currentRound &&
        rounds[currentRoundIndex - 1] &&
        currentRound.hook !== rounds[currentRoundIndex - 1].hook;

    const showColorAndHook = currentRoundIndex === 0 || hasColorChange || hasHookChange;

    // Render instruction with tappable abbreviations (handles multi-word abbrs, full text, and punctuation)
    const renderInstruction = (instruction) => {
        // First, transform the instruction for display
        const displayInstruction = displayText(instruction);

        const result = [];
        let remaining = displayInstruction;
        let keyIndex = 0;

        // Sort abbreviations by length (longest first) so "sl st" is checked before "sl" or "st"
        const sortedAbbreviations = [...CROCHET_ABBREVIATIONS].sort((a, b) =>
            Math.max(b.abbr.length, b.full.length) - Math.max(a.abbr.length, a.full.length)
        );

        while (remaining.length > 0) {
            let matched = false;

            // Try to match each abbreviation (both abbr and full text) at the current position
            for (const abbr of sortedAbbreviations) {
                // Try matching both abbreviation and full text
                const patterns = [abbr.abbr, abbr.full];

                for (const pattern of patterns) {
                    const patternLower = pattern.toLowerCase();
                    const remainingLower = remaining.toLowerCase();

                    // Check if pattern matches at current position
                    const matchIndex = remainingLower.indexOf(patternLower);

                    if (matchIndex === 0) {
                        const charAfter = remaining.charAt(pattern.length);

                        // Check word boundary after (end, space, or punctuation, but NOT a letter)
                        const isEndBoundary = !charAfter || /[\s,()x]/.test(charAfter);

                        if (isEndBoundary) {
                            // Extract the actual text (preserving case)
                            const matchedText = remaining.substring(0, pattern.length);

                            result.push(
                                <span
                                    key={keyIndex++}
                                    className={styles['tappable-abbr']}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAbbreviationHelp(abbr);
                                    }}
                                >
                                    {matchedText}
                                </span>
                            );

                            remaining = remaining.substring(pattern.length);
                            matched = true;
                            break;
                        }
                    }
                }

                if (matched) break;
            }

            if (!matched) {
                // No abbreviation matched, add the next character as plain text
                result.push(<span key={keyIndex++}>{remaining.charAt(0)}</span>);
                remaining = remaining.substring(1);
            }
        }

        return result;
    };

    return (
        <div className={styles['crochet-mode']}>
            {/* Header */}
            <div className={styles['header']}>
                <button
                    className={styles['back-button']}
                    onClick={() => navigate(`/project/${projectId}`)}
                >
                    ← Back
                </button>
                <div className={styles['header-title']}>
                    <div className={styles['component-name']}>{component.name}</div>
                    <div className={styles['progress']}>
                        {component.quantity > 1 && (
                            <span>Working on: {component.completedCount + 1} of {component.quantity} • </span>
                        )}
                        Round {currentRoundIndex + 1} of {rounds.length}
                    </div>
                </div>
                <div className={styles['spacer']} />
            </div>

            {/* Navigation Arrows */}
            {canGoLeft && (
                <button
                    className={`${styles['nav-arrow']} ${styles['nav-arrow-left']}`}
                    onClick={navigateLeft}
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            {canGoRight && (
                <button
                    className={`${styles['nav-arrow']} ${styles['nav-arrow-right']}`}
                    onClick={navigateRight}
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {/* Main Card */}
            <div
                className={styles['card-container']}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className={styles['card']}>
                    {/* Round Number */}
                    <div className={styles['round-number']}>
                        Round {currentRound.roundNumber}
                    </div>

                    {/* Color and Hook (first card or when changed) */}
                    {showColorAndHook && (
                        <div className={styles['card-meta']}>
                            <div className={styles['meta-item']}>
                                <div
                                    className={styles['color-dot']}
                                    style={{ backgroundColor: getColorHex(component.color) }}
                                />
                                <span>{component.color}</span>
                            </div>
                            <div className={styles['meta-item']}>
                                <span>{component.hook}</span>
                            </div>
                        </div>
                    )}

                    {/* Instruction */}
                    <div className={styles['instruction']}>
                        {renderInstruction(currentRound.instruction)}
                    </div>

                    {/* Target Stitch Count */}
                    <div className={styles['stitch-count']}>
                        <span className={styles['stitch-label']}>Target:</span>
                        <span className={styles['stitch-value']}>
                            {currentRound.stitchCount} {currentRound.stitchCount === 1 ? 'stitch' : 'stitches'}
                        </span>
                    </div>

                    {/* Card Actions - EXACT IntelliKnit style */}
                    <div className={styles['card-actions']}>
                        {/* Back Button - Smaller */}
                        <button
                            className={styles['undo-button']}
                            onClick={handleUndo}
                            disabled={currentRoundIndex === 0}
                            aria-label="Previous round"
                        >
                            <RotateCcw size={20} />
                        </button>

                        {/* Current number display */}
                        <div className={styles['current-number']}>
                            {currentRoundIndex + 1}
                        </div>

                        {/* Checkmark Button - LARGE */}
                        <button
                            className={styles['complete-button']}
                            onClick={handleCompleteRound}
                            aria-label="Mark complete"
                        >
                            <Check size={28} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Abbreviation Help Modal */}
            {showAbbreviationHelp && (
                <div
                    className={styles['help-modal-backdrop']}
                    onClick={() => setShowAbbreviationHelp(null)}
                >
                    <div
                        className={styles['help-modal']}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className={styles['help-close']}
                            onClick={() => setShowAbbreviationHelp(null)}
                        >
                            ×
                        </button>
                        <h3 className={styles['help-title']}>
                            {showAbbreviationHelp.full}
                        </h3>
                        <p className={styles['help-abbr']}>
                            ({showAbbreviationHelp.abbr})
                        </p>
                        <p className={styles['help-description']}>
                            {getAbbreviationDescription(showAbbreviationHelp.abbr)}
                        </p>
                    </div>
                </div>
            )}

            {/* Continue Dialog */}
            {showContinueDialog && (
                <div className={styles['help-modal-backdrop']}>
                    <div className={styles['help-modal']}>
                        <h3 className={styles['help-title']}>
                            {component.name} #{component.completedCount + 1} Complete! 🎉
                        </h3>
                        <p className={styles['help-description']} style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                            You've completed {component.completedCount + 1} of {component.quantity}.
                            {component.completedCount + 1 < component.quantity && ' Ready to start the next one?'}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className={styles['continue-button-secondary']}
                                onClick={handleStopCrocheting}
                            >
                                Stop for Now
                            </button>
                            <button
                                className={styles['continue-button-primary']}
                                onClick={handleContinueNext}
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function for descriptions
function getAbbreviationDescription(abbr) {
    const descriptions = {
        'sc': 'Insert hook into stitch, yarn over, pull through (2 loops on hook), yarn over, pull through both loops.',
        'hdc': 'Yarn over, insert hook into stitch, yarn over and pull through (3 loops on hook), yarn over and pull through all 3 loops.',
        'dc': 'Yarn over, insert hook into stitch, yarn over and pull through (3 loops on hook), yarn over and pull through 2 loops, yarn over and pull through remaining 2 loops.',
        'inc': 'Work 2 single crochet stitches in the same stitch.',
        'dec': 'Insert hook in stitch, yarn over and pull through, insert hook in next stitch, yarn over and pull through (3 loops on hook), yarn over and pull through all 3 loops.',
        'invdec': 'Insert hook in front loop of first stitch, then front loop of second stitch, yarn over and pull through both front loops, yarn over and pull through 2 loops.',
        'sc2tog': 'Insert hook in first stitch, yarn over and pull through (2 loops on hook), insert hook in next stitch, yarn over and pull through (3 loops on hook), yarn over and pull through all 3 loops. This creates one stitch from two stitches.',
        'MR': 'Wrap yarn around fingers to form a ring, insert hook through ring, yarn over and pull through, chain 1, then work stitches into the ring. Pull tail to close ring.',
        'inv fo': 'Insert hook into front loop of next stitch, pull yarn through (2 loops on hook), cut yarn leaving a tail, pull tail through both loops. Weave in end through several stitches to secure.',
        'change color': 'Work last stitch of current color until 2 loops remain on hook, yarn over with new color and pull through both loops to complete the stitch. Continue with new color. Carry unused yarn inside if working in rounds.',
        'ch': 'Yarn over and pull through loop on hook.',
        'sl st': 'Insert hook into stitch, yarn over and pull through both the stitch and the loop on hook.',
        'tr': 'Yarn over twice, insert hook into stitch, yarn over and pull through (4 loops on hook), [yarn over and pull through 2 loops] three times.',
        'FLO': 'Work into the front loop only of the stitch.',
        'BLO': 'Work into the back loop only of the stitch.',
        'st': 'A single unit of crochet work.',
        'sts': 'Multiple units of crochet work.'
    };

    return descriptions[abbr] || 'No description available.';
}

export default CrochetMode;
