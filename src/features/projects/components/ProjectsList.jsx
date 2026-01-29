import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../projects/context/ProjectsContext';
import { ACTIONS } from '../../projects/hooks/projectsReducer';
import { PageHeader, Card, EmptyState, Button, ConfirmationModal } from '../../../shared/components';
import CreateProjectFlow from './CreateProjectFlow';
import styles from './ProjectsList.module.css';

function ProjectsList() {
    const navigate = useNavigate();
    const { state, dispatch } = useProjects();
    const [menuOpenForProject, setMenuOpenForProject] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [showCreateFlow, setShowCreateFlow] = useState(false);

    const handleProjectClick = (projectId) => {
        navigate(`/project/${projectId}`);
    };

    const handleDeleteProject = (project) => {
        setMenuOpenForProject(null);
        setProjectToDelete(project);
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            dispatch({
                type: ACTIONS.DELETE_PROJECT,
                payload: projectToDelete.id
            });
            setProjectToDelete(null);
        }
    };

    const handleCreateComplete = (data) => {
        // Create project with component
        dispatch({
            type: ACTIONS.CREATE_PROJECT,
            payload: {
                name: data.project.name,
                defaultHook: data.project.defaultHook,
                defaultColor: data.project.defaultColor,
                firstComponent: data.component
            }
        });

        // Navigate to the new project
        // The project will be created with the component already added
        // We need to get the ID after it's created, so we'll navigate after a brief delay
        setTimeout(() => {
            const newProject = state.projects[state.projects.length - 1];
            if (newProject) {
                navigate(`/project/${newProject.id}`);
            }
        }, 100);
    };

    const toggleMenu = (projectId, e) => {
        e.stopPropagation(); // Don't trigger card click
        setMenuOpenForProject(menuOpenForProject === projectId ? null : projectId);
    };

    // Get last worked component name for a project
    const getLastWorkedInfo = (project) => {
        if (!project.components || project.components.length === 0) {
            return 'No components yet';
        }
        
        // For now, just show the first component
        // Later we'll track actual last worked
        const firstComponent = project.components[0];
        return `Last: ${firstComponent.name}`;
    };

    return (
        <div className={styles.projectsList}>
            <PageHeader 
                title="Projects"
                subtitle={`${state.projects.length} ${state.projects.length === 1 ? 'project' : 'projects'}`}
                onBack={() => navigate('/')}
            />

            <div className={styles.content}>
                {state.projects.length === 0 ? (
                    <EmptyState
                        icon="📋"
                        title="No projects yet"
                        description="Create your first crochet project to get started!"
                        action={
                            <Button variant="primary" onClick={() => setShowCreateFlow(true)}>
                                + Create Your First Project
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className={styles.projectCards}>
                            {state.projects.map(project => (
                                <div key={project.id} className={styles.projectCardWrapper}>
                                    <Card
                                        variant="interactive"
                                        onClick={() => handleProjectClick(project.id)}
                                    >
                                        <div className={styles.projectCardContent}>
                                            <div className={styles.projectHeader}>
                                                <h3 className={styles.projectName}>{project.name}</h3>
                                                <button
                                                    className={styles.menuButton}
                                                    onClick={(e) => toggleMenu(project.id, e)}
                                                    aria-label="Project menu"
                                                >
                                                    ⋮
                                                </button>
                                            </div>
                                            <div className={styles.projectMeta}>
                                                {project.components?.length || 0} {project.components?.length === 1 ? 'component' : 'components'} • {getLastWorkedInfo(project)}
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Three-dot menu */}
                                    {menuOpenForProject === project.id && (
                                        <div className={styles.menu}>
                                            <button
                                                className={styles.menuItem}
                                                onClick={() => {
                                                    const newName = prompt('New project name:', project.name);
                                                    if (newName && newName.trim()) {
                                                        dispatch({
                                                            type: ACTIONS.UPDATE_PROJECT,
                                                            payload: { 
                                                                id: project.id, 
                                                                name: newName.trim() 
                                                            }
                                                        });
                                                    }
                                                    setMenuOpenForProject(null);
                                                }}
                                            >
                                                ✏️ Rename
                                            </button>
                                            <button
                                                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                                                onClick={() => handleDeleteProject(project)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Button 
                            variant="primary" 
                            fullWidth
                            onClick={() => setShowCreateFlow(true)}
                        >
                            + Create New Project
                        </Button>
                    </>
                )}
            </div>

            {/* Create Project Flow Modal */}
            <CreateProjectFlow
                isOpen={showCreateFlow}
                onClose={() => setShowCreateFlow(false)}
                onComplete={handleCreateComplete}
            />

            {/* Delete Confirmation Modal */}
            {projectToDelete && (
                <ConfirmationModal
                    isOpen={!!projectToDelete}
                    onClose={() => setProjectToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Project?"
                    message={`Are you sure you want to delete "${projectToDelete.name}"? This will permanently delete all ${projectToDelete.components?.length || 0} components and their rounds.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                />
            )}
        </div>
    );
}

export default ProjectsList;
