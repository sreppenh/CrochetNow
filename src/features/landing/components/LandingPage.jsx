import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import CreateProjectModal from '../../projects/components/CreateProjectModal';
import AddComponentModal from '../../components/components/AddComponentModal';
import styles from './LandingPage.module.css';

function LandingPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useProjects();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddComponentModal, setShowAddComponentModal] = useState(false);
    const [newProjectId, setNewProjectId] = useState(null);

    // Find the most recently worked on project/component
    const getLastWorkedComponent = () => {
        // For now, just get the first project's first component
        // Later we'll add proper "last activity" tracking
        if (state.projects.length > 0) {
            const project = state.projects[0];
            if (project.components && project.components.length > 0) {
                return {
                    projectId: project.id,
                    componentId: project.components[0].id
                };
            }
        }
        return null;
    };

    const handleContinueCrocheting = () => {
        const lastWorked = getLastWorkedComponent();
        if (lastWorked) {
            // Go directly to crochet mode for last worked component
            navigate(`/project/${lastWorked.projectId}/component/${lastWorked.componentId}/crochet`);
        } else {
            // No projects yet, prompt to create one
            alert('No projects yet! Create your first project to get started.');
        }
    };

    const handleViewProjects = () => {
        navigate('/projects');
    };

    const handleCreateProject = () => {
        setShowCreateModal(true);
    };

    const handleCreateAndAddComponent = (projectData) => {
        // Create the project with a predictable ID
        const projectId = Date.now().toString();
        dispatch({
            type: ACTIONS.CREATE_PROJECT,
            payload: { ...projectData, id: projectId }
        });
        
        // Close create modal
        setShowCreateModal(false);
        
        // Store project ID and open Add Component modal
        setNewProjectId(projectId);
        setShowAddComponentModal(true);
    };

    const handleAddComponentComplete = () => {
        // Close modal and navigate to project detail
        setShowAddComponentModal(false);
        if (newProjectId) {
            navigate(`/project/${newProjectId}`);
        }
    };

    const hasProjects = state.projects.length > 0;

    return (
        <div className={styles.landing}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.logo}>🧶</div>
                <h1 className={styles.title}>CrochetNow</h1>
                <p className={styles.subtitle}>Smart stitch counting for your crochet projects</p>
            </div>

            {/* Action Cards - 2x2 Grid */}
            <div className={styles.actions}>
                {/* Top Row */}
                <div className={styles.gridRow}>
                    {/* Create New Project - Top Left */}
                    <button
                        onClick={handleCreateProject}
                        className={styles.actionCard}
                    >
                        <div className={styles.cardIcon}>✨</div>
                        <div className={styles.cardTitle}>Create Project</div>
                        <div className={styles.cardSubtitle}>Start something new</div>
                    </button>

                    {/* Continue Crocheting - Top Right (Primary if has projects) */}
                    <button
                        onClick={handleContinueCrocheting}
                        className={`${styles.actionCard} ${hasProjects ? styles.primary : ''}`}
                        disabled={!hasProjects}
                        style={!hasProjects ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                        <div className={styles.cardIcon}>🧶</div>
                        <div className={styles.cardTitle}>Continue</div>
                        <div className={styles.cardSubtitle}>Pick up where you left off</div>
                    </button>
                </div>

                {/* Bottom Row */}
                <div className={styles.gridRow}>
                    {/* View Projects - Bottom Left */}
                    <button
                        onClick={handleViewProjects}
                        className={styles.actionCard}
                        disabled={!hasProjects}
                        style={!hasProjects ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                        <div className={styles.cardIcon}>📋</div>
                        <div className={styles.cardTitle}>View Projects</div>
                        <div className={styles.cardSubtitle}>See all patterns</div>
                    </button>

                    {/* Future Feature - Bottom Right (Placeholder) */}
                    <button
                        className={styles.actionCard}
                        disabled
                        style={{ opacity: 0.3, cursor: 'not-allowed' }}
                    >
                        <div className={styles.cardIcon}>📖</div>
                        <div className={styles.cardTitle}>Reference</div>
                        <div className={styles.cardSubtitle}>Coming soon</div>
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <p className={styles.footerText}>Happy crocheting! 🧶</p>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateAndAddComponent={handleCreateAndAddComponent}
            />

            {/* Add Component Modal */}
            {newProjectId && (
                <AddComponentModal
                    isOpen={showAddComponentModal}
                    onClose={handleAddComponentComplete}
                    projectId={newProjectId}
                />
            )}
        </div>
    );
}

export default LandingPage;
