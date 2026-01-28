import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectsContext';
import { ACTIONS } from '../hooks/projectsReducer';
import { PageHeader, Card, EmptyState, Button } from '../../../shared/components';
import './ProjectList.css';

function ProjectList() {
    const { state, dispatch } = useProjects();
    const navigate = useNavigate();

    const handleCreateProject = () => {
        const name = prompt('Project name:');
        if (name && name.trim()) {
            dispatch({
                type: ACTIONS.CREATE_PROJECT,
                payload: { name: name.trim() }
            });
        }
    };

    return (
        <div>
            {/* Header */}
            <PageHeader 
                title="🧶 CrochetGenius"
                subtitle="Your Amigurumi Projects"
            />

            {/* Content */}
            <div className="content">
                {state.projects.length === 0 ? (
                    <EmptyState
                        icon="🧸"
                        title="Welcome to CrochetGenius!"
                        description="Create your first amigurumi project to get started"
                        action={
                            <Button variant="primary" onClick={handleCreateProject}>
                                + Create Your First Project
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className="section-header">
                            <span>Projects</span>
                            <span className="count">{state.projects.length} projects</span>
                        </div>
                        
                        <div className="project-list">
                            {state.projects.map(project => (
                                <Card
                                    key={project.id} 
                                    variant="interactive"
                                    onClick={() => navigate(`/project/${project.id}`)}
                                >
                                    <div className="project-name">{project.name}</div>
                                    <div className="project-meta">
                                        {project.components.length} {project.components.length === 1 ? 'component' : 'components'}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <Button 
                            variant="primary" 
                            fullWidth
                            onClick={handleCreateProject}
                        >
                            + Create New Project
                        </Button>
                    </>
                )}

                <div className="help-note">
                    <strong>💡 Welcome to CrochetGenius!</strong><br />
                    This is your foundation. You'll add components (head, arms, legs) to each project, 
                    then add rounds with smart stitch counting. More features coming soon!
                </div>
            </div>
        </div>
    );
}

export default ProjectList;
