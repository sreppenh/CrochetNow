import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../projects/context/ProjectsContext';
import { PageHeader, Card, EmptyState, Button } from '../../../shared/components';
import AddComponentModal from '../../components/components/AddComponentModal';
import EditProjectModal from './EditProjectModal';
import { YARN_COLORS } from '../../../shared/data/yarnColors';
import styles from './ProjectDetail.module.css';

function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { state } = useProjects();
    const [showAddComponentModal, setShowAddComponentModal] = useState(false);
    const [showEditProject, setShowEditProject] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Find the current project
    const project = state.projects.find(p => p.id === projectId);

    // If not found, redirect
    if (!project) {
        navigate('/');
        return null;
    }

    const handleComponentClick = (componentId) => {
        // Navigate directly to crochet mode
        navigate(`/project/${projectId}/component/${componentId}/crochet`);
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
                                                <span className={getStatusClass(component.completedCount, component.quantity)}>
                                                    {component.completedCount} of {component.quantity} {isComplete ? 'complete' : component.completedCount === 0 ? '' : 'done'}
                                                </span>
                                            </div>
                                            <div className={styles['component-meta']}>
                                                <div 
                                                    className={styles['color-dot']}
                                                    style={{ backgroundColor: getColorHex(component.color) }}
                                                    title={component.color}
                                                />
                                                <span className={styles['hook-size']}>{component.hook}</span>
                                                <span className={styles['rounds-count']}>
                                                    {component.rounds?.length || 0} {component.rounds?.length === 1 ? 'rnd' : 'rnds'}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className={styles['button-group']}>
                            <Button 
                                variant="primary"
                                fullWidth
                                onClick={() => setShowAddComponentModal(true)}
                            >
                                + Add Component
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Add Component Modal */}
            <AddComponentModal
                isOpen={showAddComponentModal}
                onClose={() => setShowAddComponentModal(false)}
                projectId={projectId}
                onSuccess={(componentId) => {
                    // Navigate directly to the new component's detail page
                    navigate(`/project/${projectId}/component/${componentId}`);
                }}
            />

            {/* Edit Project Modal */}
            <EditProjectModal
                isOpen={showEditProject}
                onClose={() => setShowEditProject(false)}
                project={project}
            />
        </div>
    );
}

export default ProjectDetail;
