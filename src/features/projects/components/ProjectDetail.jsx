import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import { PageHeader, Card, EmptyState, Button } from '../../../shared/components';
import ComponentCreationModal from '../../components/components/ComponentCreationModal';
import styles from './ProjectDetail.module.css';

function ProjectDetail() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { state } = useProjects();
    const [showAddComponentModal, setShowAddComponentModal] = useState(false);

    // Find the current project
    const project = state.projects.find(p => p.id === projectId);

    // If project not found, redirect to home
    if (!project) {
        navigate('/');
        return null;
    }

    return (
        <div className={styles['project-detail']}>
            <PageHeader 
                title={project.name}
                subtitle={`${project.components.length} ${project.components.length === 1 ? 'component' : 'components'}`}
                onBack={() => navigate('/')}
            />

            <div className={styles.content}>
                <div className={styles['section-header']}>
                    <span>Components</span>
                </div>

                {project.components.length === 0 ? (
                    <EmptyState
                        icon="🧶"
                        title="No components yet"
                        description="Add your first component (like head, arms, legs) to get started!"
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
                            {project.components.map(component => (
                                <Card 
                                    key={component.id}
                                    variant="interactive"
                                    onClick={() => navigate(`/project/${projectId}/component/${component.id}`)}
                                >
                                    <div className={styles['component-card-header']}>
                                        <span className={styles['component-name']}>{component.name}</span>
                                        <span className={styles['component-quantity-badge']}>
                                            {component.completedCount} of {component.quantity}
                                        </span>
                                    </div>
                                    <div className={styles['component-meta']}>
                                        {component.rounds.length} {component.rounds.length === 1 ? 'round' : 'rounds'}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <Button 
                            variant="primary" 
                            fullWidth
                            onClick={() => setShowAddComponentModal(true)}
                        >
                            + Add Component
                        </Button>
                    </>
                )}

                <div className={styles['help-note']}>
                    <strong>💡 Tip:</strong> Components are the body parts you'll crochet (like head, arms, legs). 
                    Click a component to add rounds!
                </div>
            </div>

            {/* Add Component Modal */}
            <ComponentCreationModal
                isOpen={showAddComponentModal}
                onClose={() => setShowAddComponentModal(false)}
                projectId={projectId}
            />
        </div>
    );
}

export default ProjectDetail;
