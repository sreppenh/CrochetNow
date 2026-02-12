import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { PageHeader, Card, EmptyState, Button, ConfirmationModal } from '../../../shared/components';
import RoundEntryModal from '../../rounds/components/RoundEntryModal';
import EditRoundModal from '../../rounds/components/EditRoundModal';
import AddComponentModal from './AddComponentModal';
import EditComponentModal from './EditComponentModal';
import { YARN_COLORS } from '../../../shared/data/yarnColors';
import styles from './ComponentDetail.module.css';

function ComponentDetail() {
    const { projectId, componentId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useProjects();
    const [showAddRoundModal, setShowAddRoundModal] = useState(false);
    const [showAddComponentModal, setShowAddComponentModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditComponent, setShowEditComponent] = useState(false);
    const [editingRound, setEditingRound] = useState(null);
    const [deletingRound, setDeletingRound] = useState(null);

    // Find the current project and component
    const project = state.projects.find(p => p.id === projectId);
    const component = project?.components.find(c => c.id === componentId);

    // If not found, redirect back
    if (!project || !component) {
        navigate('/');
        return null;
    }

    const handleSave = () => {
        // Everything auto-saves, so just navigate back
        navigate(`/project/${projectId}`);
    };

    const handleNextComponent = () => {
        // Open Add Component modal
        setShowAddComponentModal(true);
    };

    const handleComponentAdded = () => {
        // After adding new component, close modal
        // The new component will be the last one in the array
        setShowAddComponentModal(false);
        const newComponent = project.components[project.components.length - 1];
        if (newComponent) {
            // Navigate to the new component's detail
            navigate(`/project/${projectId}/component/${newComponent.id}`);
        }
    };

    const handleDeleteComponent = () => {
        setShowMenu(false);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        dispatch({
            type: ACTIONS.DELETE_COMPONENT,
            payload: { projectId, componentId }
        });
        navigate(`/project/${projectId}`);
    };

    const handleDeleteRound = (round) => {
        setDeletingRound(round);
    };

    const confirmDeleteRound = () => {
        if (deletingRound) {
            dispatch({
                type: ACTIONS.DELETE_ROUND,
                payload: { projectId, componentId, roundId: deletingRound.id }
            });
            setDeletingRound(null);
        }
    };

    const handleCopyRound = (round) => {
        // Get the previous round's ending stitch count to use as starting point
        const previousRound = component.rounds[component.rounds.length - 1];
        const previousEndingStitches = previousRound?.stitchCount || 0;

        // Calculate the stitch change from the original round
        const originalStitchChange = round.stitchCount - (component.rounds[round.roundNumber - 2]?.stitchCount || 0);

        // Apply that same stitch change to the previous ending stitches
        const newStitchCount = previousEndingStitches + originalStitchChange;

        dispatch({
            type: ACTIONS.ADD_ROUND,
            payload: {
                projectId,
                componentId,
                instruction: round.instruction,
                stitchCount: Math.max(0, newStitchCount) // Ensure non-negative
            }
        });
    };

    // Get color hex for display
    const getColorHex = (colorName) => {
        return YARN_COLORS.find(c => c.name === colorName)?.hex || '#cccccc';
    };

    return (
        <div className={styles['component-detail']}>
            <PageHeader
                title={component.name}
                subtitle={`${component.completedCount} of ${component.quantity} completed`}
                onBack={() => navigate(`/project/${projectId}`)}
                actions={
                    <div className={styles['menu-wrapper']}>
                        <button
                            className={styles['menu-button']}
                            onClick={() => setShowMenu(!showMenu)}
                            aria-label="Component menu"
                        >
                            ⋮
                        </button>
                        {showMenu && (
                            <div className={styles['menu']}>
                                <button
                                    className={styles['menu-item']}
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowEditComponent(true);
                                    }}
                                >
                                    ✏️ Edit Component
                                </button>
                                <button
                                    className={`${styles['menu-item']} ${styles['menu-item-danger']}`}
                                    onClick={handleDeleteComponent}
                                >
                                    🗑️ Delete Component
                                </button>
                            </div>
                        )}
                    </div>
                }
            />

            <div className={styles.content}>
                {/* Component Info Card */}
                <div className={styles['info-card']}>
                    <div className={styles['info-row']}>
                        <div className={styles['info-item']}>
                            <span className={styles['info-label']}>Color:</span>
                            <div className={styles['color-display']}>
                                <div
                                    className={styles['color-dot']}
                                    style={{ backgroundColor: getColorHex(component.color) }}
                                />
                                <span>{component.color}</span>
                            </div>
                        </div>
                        <div className={styles['info-item']}>
                            <span className={styles['info-label']}>Hook:</span>
                            <span className={styles['info-value']}>{component.hook}</span>
                        </div>
                    </div>
                </div>

                {/* Rounds Section */}
                <div className={styles['section-header']}>
                    <span>Rounds</span>
                    <span className={styles['rounds-count']}>
                        {component.rounds.length} {component.rounds.length === 1 ? 'round' : 'rounds'}
                    </span>
                </div>

                {component.rounds.length === 0 ? (
                    <EmptyState
                        icon="🧶"
                        title="No rounds yet"
                        description="Add your first round to start tracking your pattern!"
                        action={
                            <Button
                                variant="primary"
                                onClick={() => setShowAddRoundModal(true)}
                            >
                                + Add Your First Round
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className={styles['round-list']}>
                            {component.rounds.map((round, index) => {
                                return (
                                    <div key={round.id} className={styles['round-card-wrapper']}>
                                        <Card
                                            variant="interactive"
                                            onClick={() => setEditingRound(round)}
                                        >
                                            <div className={styles['round-header']}>
                                                <span className={styles['round-number']}>Rnd {round.roundNumber}</span>
                                                <div className={styles['round-actions']}>
                                                    <span className={styles['stitch-badge']}>
                                                        {round.stitchCount} {round.stitchCount === 1 ? 'st' : 'sts'}
                                                    </span>
                                                    <button
                                                        className={styles['copy-button']}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopyRound(round);
                                                        }}
                                                        aria-label="Copy round"
                                                        title="Copy round"
                                                    >
                                                        ⎘
                                                    </button>
                                                    <button
                                                        className={styles['round-menu-button']}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteRound(round);
                                                        }}
                                                        aria-label="Delete round"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles['round-instruction']}>
                                                {round.instruction}
                                            </div>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className={styles['action-section']}>
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={() => setShowAddRoundModal(true)}
                            >
                                + Add Round
                            </Button>

                            <div className={styles['exit-buttons']}>
                                <Button
                                    variant="tertiary"
                                    onClick={handleSave}
                                    fullWidth={false}
                                >
                                    Save
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleNextComponent}
                                    fullWidth={false}
                                >
                                    Next Component →
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {component.rounds.length === 0 && (
                    <div className={styles['help-note']}>
                        <strong>💡 Try adding rounds:</strong><br />
                        • <code>6 sc in MR</code> - Magic ring start<br />
                        • <code>inc in each st</code> - Double your stitches<br />
                        • <code>(sc, inc) x 6</code> - Pattern repeats<br />
                        Use the abbreviation buttons to build your instructions!
                    </div>
                )}
            </div>

            {/* Add Round Modal */}
            <RoundEntryModal
                isOpen={showAddRoundModal}
                onClose={() => setShowAddRoundModal(false)}
                projectId={projectId}
                componentId={componentId}
            />

            {/* Edit Round Modal */}
            {editingRound && (
                <EditRoundModal
                    isOpen={!!editingRound}
                    onClose={() => setEditingRound(null)}
                    projectId={projectId}
                    componentId={componentId}
                    round={editingRound}
                />
            )}

            {/* Add Component Modal */}
            <AddComponentModal
                isOpen={showAddComponentModal}
                onClose={handleComponentAdded}
                projectId={projectId}
            />

            {/* Edit Component Modal */}
            <EditComponentModal
                isOpen={showEditComponent}
                onClose={() => setShowEditComponent(false)}
                projectId={projectId}
                component={component}
            />

            {/* Delete Component Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Component?"
                message={`Are you sure you want to delete "${component.name}"? This will permanently delete all ${component.rounds.length} rounds for this component.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />

            {/* Delete Round Confirmation Modal */}
            {deletingRound && (
                <ConfirmationModal
                    isOpen={!!deletingRound}
                    onClose={() => setDeletingRound(null)}
                    onConfirm={confirmDeleteRound}
                    title="Delete Round?"
                    message={`Are you sure you want to delete Round ${deletingRound.roundNumber}? This cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                />
            )}
        </div>
    );
}

export default ComponentDetail;
