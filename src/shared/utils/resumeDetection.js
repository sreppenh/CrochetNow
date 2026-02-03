/**
 * Resume Detection for CrochetNow
 * Finds the most recently worked on project/component based on lastActivityAt
 */

export const getResumeData = () => {
    const storage = localStorage.getItem('crochetgenius_state');
    
    if (!storage) {
        return { hasActiveProject: false };
    }

    try {
        const state = JSON.parse(storage);
        const projects = state.projects || [];

        if (projects.length === 0) {
            return { hasActiveProject: false };
        }

        // Find project with most recent lastActivityAt
        let mostRecentProject = null;
        let mostRecentComponent = null;
        let mostRecentTimestamp = 0;

        projects.forEach(project => {
            if (project.lastActivityAt) {
                const timestamp = new Date(project.lastActivityAt).getTime();
                
                if (timestamp > mostRecentTimestamp) {
                    mostRecentTimestamp = timestamp;
                    mostRecentProject = project;

                    // Find the component with currentRound > 0 (or first component)
                    mostRecentComponent = project.components.find(c => c.currentRound > 0) 
                        || project.components[0];
                }
            }
        });

        if (!mostRecentProject || !mostRecentComponent) {
            return { hasActiveProject: false };
        }

        return {
            hasActiveProject: true,
            projectId: mostRecentProject.id,
            componentId: mostRecentComponent.id,
            currentRound: mostRecentComponent.currentRound || 0,
            lastActivity: mostRecentTimestamp
        };
    } catch (error) {
        console.error('Error getting resume data:', error);
        return { hasActiveProject: false };
    }
};
