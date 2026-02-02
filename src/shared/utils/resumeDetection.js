/**
 * Resume Detection Utility
 * Finds the most recently worked on project/component for Continue functionality
 * Based on IntelliKnit's resumeDetection.js
 */

export const getResumeData = () => {
    try {
        // Get all projects from localStorage
        const projectsData = localStorage.getItem('crochetgenius-projects');
        if (!projectsData) {
            return { hasActiveProject: false };
        }

        const projects = JSON.parse(projectsData);
        
        if (!projects || projects.length === 0) {
            return { hasActiveProject: false };
        }

        // Find project with most recent lastActivityAt timestamp
        let mostRecentActivity = null;
        let mostRecentTimestamp = 0;

        projects.forEach(project => {
            const projectTimestamp = project.lastActivityAt ? new Date(project.lastActivityAt).getTime() : 0;

            if (projectTimestamp > mostRecentTimestamp) {
                mostRecentTimestamp = projectTimestamp;

                // Find component with currentRound set (the one being worked on)
                const activeComponent = project.components?.find(c => 
                    c.currentRound !== undefined && c.currentRound >= 0 && c.rounds && c.rounds.length > 0
                );

                if (activeComponent) {
                    mostRecentActivity = {
                        projectId: project.id,
                        componentId: activeComponent.id,
                        currentRound: activeComponent.currentRound
                    };
                } else if (project.components && project.components.length > 0) {
                    // Fallback: if no currentRound set, use first component with rounds
                    const firstComponentWithRounds = project.components.find(c => c.rounds && c.rounds.length > 0);
                    if (firstComponentWithRounds) {
                        mostRecentActivity = {
                            projectId: project.id,
                            componentId: firstComponentWithRounds.id,
                            currentRound: firstComponentWithRounds.currentRound ?? 0
                        };
                    }
                }
            }
        });

        if (!mostRecentActivity) {
            return { hasActiveProject: false };
        }

        return {
            hasActiveProject: true,
            ...mostRecentActivity,
            lastActivity: mostRecentTimestamp
        };
    } catch (error) {
        console.error('Error in getResumeData:', error);
        return { hasActiveProject: false };
    }
};
