import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { getResumeData } from '../../../shared/utils/resumeDetection';
import CreateProjectFlow from '../../projects/components/CreateProjectFlow';
import styles from './LandingPage.module.css';

function LandingPage() {
    const navigate = useNavigate();
    const { state, dispatch } = useProjects();
    const [showCreateFlow, setShowCreateFlow] = useState(false);

    const handleContinueCrocheting = () => {
        const resumeData = getResumeData();

        if (!resumeData.hasActiveProject) {
            alert('No projects yet! Create your first project to get started.');
            return;
        }

        // Navigate to crochet mode for the last worked component
        navigate(`/project/${resumeData.projectId}/component/${resumeData.componentId}/crochet`);
    };

    const handleViewProjects = () => {
        navigate('/projects');
    };

    const handleCreateProject = () => {
        setShowCreateFlow(true);
    };

    const handleCreateComplete = (data) => {
        // Create project with component, using predictable IDs
        const projectId = Date.now().toString();
        const componentId = (Date.now() + 1).toString();
        
        dispatch({
            type: ACTIONS.CREATE_PROJECT,
            payload: {
                id: projectId,
                name: data.project.name,
                defaultHook: data.project.defaultHook,
                defaultColor: data.project.defaultColor,
                firstComponent: {
                    id: componentId,
                    ...data.component
                }
            }
        });

        // Navigate directly to the component detail page to add rounds
        navigate(`/project/${projectId}/component/${componentId}`);
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

            {/* Create Project Flow Modal */}
            <CreateProjectFlow
                isOpen={showCreateFlow}
                onClose={() => setShowCreateFlow(false)}
                onComplete={handleCreateComplete}
            />
        </div>
    );
}

export default LandingPage;
