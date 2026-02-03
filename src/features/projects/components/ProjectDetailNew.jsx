import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { PageHeader, Card, EmptyState, Button } from '../../../shared/components';
import AddComponentModal from '../../components/components/AddComponentModal';
import EditProjectModal from './EditProjectModal';
import { YARN_COLORS } from '../../../shared/data/yarnColors';
import styles from './ProjectDetail.module.css';

function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useProjects();
    const [showAddComponentModal, setShowAddComponentModal] = useState(false);
    const [showEditProject, setShowEditProject] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [selectedComponentId, setSelectedComponentId] = useState(null);

    // Find the current project
    const project = state.projects.find(p => p.id === projectId);

    // If not found, redirect
    if (!project) {
        navigate('/');
        return null;
    }

    // Get fresh component data from state (updates live when +/- clicked)
    const selectedComponent = selectedComponentId 
        ? project.components.find(c => c.id === selectedComponentId)
        : null;

    const handleComponentClick = (componentId) => {
        // Navigate directly to crochet mode
        navigate(`/project/${projectId}/component/${componentId}/crochet`);
    };

    const handleCompletionBadgeClick = (e, component) => {
        e.stopPropagation(); // Don't trigger component click
        setSelectedComponentId(component.id);
        setShowCompletionModal(true);
    };

    const handleIncrement = () => {
        if (selectedComponentId) {
            const component = project.components.find(c => c.id === selectedComponentId);
            if (component && component.completedCount < component.quantity) {
                dispatch({
                    type: ACTIONS.INCREMENT_COMPONENT_COMPLETION,
                    payload: {
                        projectId,
                        componentId: selectedComponentId
                    }
                });
            }
        }
    };

    const handleDecrement = () => {
        if (selectedComponentId) {
            const component = project.components.find(c => c.id === selectedComponentId);
            if (component && component.completedCount > 0) {
                dispatch({
                    type: ACTIONS.DECREMENT_COMPONENT_COMPLETION,
                    payload: {
                        projectId,
                        componentId: selectedComponentId
                    }
                });
            }
        }
    };

    // Get status badge class based on completion
    const getStatusClass = (completedCount, quantity) => {
        if (completedCount === 0) return styles['badge-not-started'];
        if (completedCount < quantity) return styles['badge-in-progress'];
        return styles['badge-complete'];
    };

    // Get color hex for display
    const getColorHex = (colorName) => {
        return YARN_COLORS.find(c => c.name === colorName)?.hex || '#cccccc';
    };

    return (
        <div className={styles['project-detail']}>
            <PageHeader 
                title={project.name}
                subtitle={`${project.components.length} ${project.components.length === 1 ? 'component' : 'components'}`}
                onBack={() => navigate('/projects')}
                actions={
                    <div className={styles['menu-wrapper']}>
                        <button
                            className={styles['menu-button']}
                            onClick={() => setShowMenu(!showMenu)}
                            aria-label="Project menu"
                        >
                            ⋮
                        </button>
                        {showMenu && (
                            <div className={styles['menu']}>
                                <button
                                    className={styles['menu-item']}
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowEditProject(true);
                                    }}
                                >
                                    ✏️ Edit Project
                                </button>
                            </div>
                        )}
                    </div>
                }
            />

            <div className={styles.content}>
                {project.components.length === 0 ? (
                    <EmptyState
                        icon="🧶"
                        title="No components yet"
                        description="Add your first component to get started!"
                        action={
                            <Button 
                                variant="primary" 
                                onClick={() => setShowAddComponentModal(true)}
                            >
                                + Add Your First Component
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className={styles['component-list']}>
                            {project.components.map(component => {
                                const isComplete = component.completedCount >= component.quantity;
                                return (
                                    <Card
                                        key={component.id}
                                        variant="interactive"
                                        onClick={() => handleComponentClick(component.id)}
                                        className={isComplete ? styles['component-complete'] : ''}
                                    >
                                        <div className={styles['component-header']}>
                                            <div className={styles['component-name-row']}>
                                                <span className={styles['component-name']}>
                                                    {isComplete && '✓ '}
                                                    {component.name}
                                                </span>
                                                <button
                                                    className={styles['edit-button']}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/project/${projectId}/component/${component.id}`);
                                                    }}
                                                    aria-label="Edit rounds"
                                                >
                                                    ✏️
                                                </button>
                                                {/* Clickable completion badge */}
                                                <button
                                                    className={`${styles['completion-badge']} ${getStatusClass(component.completedCount, component.quantity)}`}
                                                    onClick={(e) => handleCompletionBadgeClick(e, component)}
                                                    aria-label="Adjust completion"
                                                >
                                                    {component.completedCount} of {component.quantity} ↗
                                                </button>
                                            </div>
                                            <div className={styles['component-meta']}>
                                                <div 
                                                    className={styles['color-dot']}
                                                    style={{ backgroundColor: getColorHex(component.color) }}
                                                    title={component.color}
                                                />
                                                <span className={styles['hook-size']}>{component.hook}</span>
                                                <span className={styles['rounds-count']}>
                                                    {component.rounds?.length || 0} {component.rounds?.length === 1 ? 'round' : 'rounds'}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Add Component Button */}
                        <div className={styles['add-component-section']}>
                            <Button 
                                variant="secondary"
                                fullWidth
                                onClick={() => setShowAddComponentModal(true)}
                            >
                                + Add Component
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <AddComponentModal
                isOpen={showAddComponentModal}
                onClose={() => setShowAddComponentModal(false)}
                projectId={projectId}
            />

            <EditProjectModal
                isOpen={showEditProject}
                onClose={() => setShowEditProject(false)}
                project={project}
            />

            {/* Completion Overlay Modal */}
            {showCompletionModal && selectedComponent && (
                <div className={styles['modal-backdrop']} onClick={() => setShowCompletionModal(false)}>
                    <div className={styles['completion-modal']} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles['modal-close']}
                            onClick={() => setShowCompletionModal(false)}
                        >
                            ×
                        </button>
                        <h3 className={styles['modal-title']}>{selectedComponent.name}</h3>
                        <p className={styles['modal-subtitle']}>Adjust completion count</p>
                        
                        <div className={styles['completion-display']}>
                            <div className={styles['completion-number']}>
                                {selectedComponent.completedCount}
                            </div>
                            <div className={styles['completion-separator']}>/</div>
                            <div className={styles['completion-total']}>
                                {selectedComponent.quantity}
                            </div>
                        </div>

                        <div className={styles['completion-progress-bar']}>
                            <div 
                                className={styles['completion-progress-fill']}
                                style={{ width: `${(selectedComponent.completedCount / selectedComponent.quantity) * 100}%` }}
                            />
                        </div>

                        <div className={styles['completion-controls']}>
                            <button
                                className={styles['completion-btn-decrement']}
                                onClick={handleDecrement}
                                disabled={selectedComponent.completedCount === 0}
                            >
                                −
                            </button>
                            <button
                                className={styles['completion-btn-increment']}
                                onClick={handleIncrement}
                                disabled={selectedComponent.completedCount >= selectedComponent.quantity}
                            >
                                +
                            </button>
                        </div>

                        {selectedComponent.completedCount === selectedComponent.quantity && (
                            <div className={styles['completion-message']}>
                                ✓ All complete!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectDetail;
