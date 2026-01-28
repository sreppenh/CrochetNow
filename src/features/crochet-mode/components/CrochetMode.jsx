import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { YARN_COLORS } from '../../../shared/data/yarnColors';
import { CROCHET_ABBREVIATIONS } from '../../../shared/data/crochetAbbreviations';
import styles from './CrochetMode.module.css';

function CrochetMode() {
    const { projectId, componentId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useProjects();
    
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    const [showAbbreviationHelp, setShowAbbreviationHelp] = useState(null);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Find project and component
    const project = state.projects.find(p => p.id === projectId);
    const component = project?.components.find(c => c.id === componentId);

    // Redirect if not found
    useEffect(() => {
        if (!project || !component || !component.rounds || component.rounds.length === 0) {
            navigate(`/project/${projectId}/component/${componentId}`);
        }
    }, [project, component, projectId, componentId, navigate]);

    if (!project || !component || !component.rounds || component.rounds.length === 0) {
        return null;
    }

    const rounds = component.rounds;
    const currentRound = rounds[currentRoundIndex];

    // Get color hex for display
    const getColorHex = (colorName) => {
        return YARN_COLORS.find(c => c.name === colorName)?.hex || '#cccccc';
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

    // Show color/hook on first card or when they change
    const showColorAndHook = currentRoundIndex === 0 || hasColorChange || hasHookChange;

    // Handle complete round
    const handleCompleteRound = () => {
        // Mark round as complete (we'll add this to the data structure)
        // For now, just advance to next round
        if (currentRoundIndex < rounds.length - 1) {
            setCurrentRoundIndex(currentRoundIndex + 1);
        } else {
            // Last round completed - show celebration or go back
            alert('Component complete! 🎉');
            navigate(`/project/${projectId}/component/${componentId}`);
        }
    };

    // Handle undo
    const handleUndo = () => {
        if (currentRoundIndex > 0) {
            setCurrentRoundIndex(currentRoundIndex - 1);
        }
    };

    // Navigation
    const canGoLeft = currentRoundIndex > 0;
    const canGoRight = currentRoundIndex < rounds.length - 1;

    const navigateLeft = useCallback(() => {
        if (canGoLeft) {
            setCurrentRoundIndex(prev => prev - 1);
        }
    }, [canGoLeft]);

    const navigateRight = useCallback(() => {
        if (canGoRight) {
            setCurrentRoundIndex(prev => prev + 1);
        }
    }, [canGoRight]);

    // Touch handlers for swipe
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

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') navigateLeft();
            if (e.key === 'ArrowRight') navigateRight();
            if (e.key === 'Escape') navigate(`/project/${projectId}/component/${componentId}`);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigateLeft, navigateRight, navigate, projectId, componentId]);

    // Parse instruction and make abbreviations tappable
    const renderInstruction = (instruction) => {
        const words = instruction.split(/(\s+)/);
        
        return words.map((word, index) => {
            const cleanWord = word.trim().toLowerCase();
            const abbr = CROCHET_ABBREVIATIONS.find(a => 
                a.abbr.toLowerCase() === cleanWord
            );

            if (abbr) {
                return (
                    <span
                        key={index}
                        className={styles['tappable-abbr']}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowAbbreviationHelp(abbr);
                        }}
                    >
                        {word}
                    </span>
                );
            }
            return <span key={index}>{word}</span>;
        });
    };

    return (
        <div className={styles['crochet-mode']}>
            {/* Header */}
            <div className={styles['header']}>
                <button 
                    className={styles['back-button']}
                    onClick={() => navigate(`/project/${projectId}/component/${componentId}`)}
                >
                    ← Back
                </button>
                <div className={styles['header-title']}>
                    <div className={styles['component-name']}>{component.name}</div>
                    <div className={styles['progress']}>
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
                </div>
            </div>

            {/* Footer Actions */}
            <div className={styles['footer']}>
                <button
                    className={styles['undo-button']}
                    onClick={handleUndo}
                    disabled={currentRoundIndex === 0}
                >
                    <RotateCcw size={18} />
                    <span>Undo</span>
                </button>
                <button
                    className={styles['complete-button']}
                    onClick={handleCompleteRound}
                >
                    Complete Round
                </button>
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
        </div>
    );
}

// Helper function to get detailed descriptions
function getAbbreviationDescription(abbr) {
    const descriptions = {
        'sc': 'Insert hook into stitch, yarn over, pull through (2 loops on hook), yarn over, pull through both loops.',
        'hdc': 'Yarn over, insert hook into stitch, yarn over and pull through (3 loops on hook), yarn over and pull through all 3 loops.',
        'dc': 'Yarn over, insert hook into stitch, yarn over and pull through (3 loops on hook), yarn over and pull through 2 loops, yarn over and pull through remaining 2 loops.',
        'inc': 'Work 2 single crochet stitches in the same stitch.',
        'dec': 'Insert hook in stitch, yarn over and pull through, insert hook in next stitch, yarn over and pull through (3 loops on hook), yarn over and pull through all 3 loops.',
        'invdec': 'Insert hook in front loop of first stitch, then front loop of second stitch, yarn over and pull through both front loops, yarn over and pull through 2 loops.',
        'MR': 'Wrap yarn around fingers to form a ring, insert hook through ring, yarn over and pull through, chain 1, then work stitches into the ring. Pull tail to close ring.',
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
