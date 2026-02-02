/**
 * Projects Reducer
 * State management for CrochetGenius projects
 * Simplified from IntelliKnit - only what we need for crochet
 */

import logger from '../../../shared/utils/logger';

export const ACTIONS = {
    LOAD_PROJECTS: 'LOAD_PROJECTS',
    CREATE_PROJECT: 'CREATE_PROJECT',
    UPDATE_PROJECT: 'UPDATE_PROJECT',
    DELETE_PROJECT: 'DELETE_PROJECT',
    SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
    ADD_COMPONENT: 'ADD_COMPONENT',
    UPDATE_COMPONENT: 'UPDATE_COMPONENT',
    DELETE_COMPONENT: 'DELETE_COMPONENT',
    ADD_ROUND: 'ADD_ROUND',
    UPDATE_ROUND: 'UPDATE_ROUND',
    DELETE_ROUND: 'DELETE_ROUND',
    INCREMENT_COMPONENT_COMPLETION: 'INCREMENT_COMPONENT_COMPLETION',
    DECREMENT_COMPONENT_COMPLETION: 'DECREMENT_COMPONENT_COMPLETION',
    SET_COMPONENT_COMPLETION: 'SET_COMPONENT_COMPLETION',
    UPDATE_CURRENT_ROUND: 'UPDATE_CURRENT_ROUND'
};

export const initialState = {
    projects: [],
    currentProject: null
};

// Helper function to update project activity timestamp (like IntelliKnit)
const updateProjectActivity = (project) => ({
    ...project,
    lastActivityAt: new Date().toISOString()
});

export function projectsReducer(state, action) {
    switch (action.type) {
        case ACTIONS.LOAD_PROJECTS:
            return {
                ...state,
                projects: action.payload
            };

        case ACTIONS.CREATE_PROJECT: {
            const newProject = {
                id: action.payload.id || Date.now().toString(),
                name: action.payload.name,
                defaultHook: action.payload.defaultHook,
                defaultColor: action.payload.defaultColor || null,
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(), // Track activity
                components: []
            };

            // If firstComponent provided, add it
            if (action.payload.firstComponent) {
                const firstComp = action.payload.firstComponent;
                newProject.components.push({
                    id: firstComp.id || Date.now().toString(),
                    name: firstComp.name,
                    quantity: firstComp.quantity,
                    completedCount: 0,
                    color: firstComp.color,
                    hook: firstComp.hook,
                    currentRound: 0, // Track current position like IntelliKnit's currentStep
                    rounds: [],
                    created: new Date().toISOString(),
                    updated: new Date().toISOString()
                });
            }

            logger.success('Project created', { name: newProject.name });

            return {
                ...state,
                projects: [...state.projects, newProject],
                currentProject: newProject
            };
        }

        case ACTIONS.UPDATE_PROJECT: {
            const updatedProjects = state.projects.map(p =>
                p.id === action.payload.id
                    ? { ...action.payload, updated: new Date().toISOString() }
                    : p
            );

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === action.payload.id
                    ? { ...action.payload, updated: new Date().toISOString() }
                    : state.currentProject
            };
        }

        case ACTIONS.DELETE_PROJECT: {
            const filtered = state.projects.filter(p => p.id !== action.payload);
            
            logger.success('Project deleted');

            return {
                ...state,
                projects: filtered,
                currentProject: state.currentProject?.id === action.payload ? null : state.currentProject
            };
        }

        case ACTIONS.SET_CURRENT_PROJECT: {
            const project = state.projects.find(p => p.id === action.payload);
            return {
                ...state,
                currentProject: project || null
            };
        }

        case ACTIONS.ADD_COMPONENT: {
            const { projectId, componentId, name, quantity, color, hook } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const newComponent = {
                        id: componentId || Date.now().toString(),
                        name,
                        quantity: quantity || 1,
                        color,
                        hook,
                        completedCount: 0,
                        currentRound: 0, // Track current position
                        rounds: []
                    };

                    const updatedProject = {
                        ...project,
                        components: [...project.components, newComponent],
                        updated: new Date().toISOString()
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            logger.success('Component added', { name });

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        case ACTIONS.UPDATE_COMPONENT: {
            const { projectId, componentId, name, quantity, color, hook } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const updatedProject = {
                        ...project,
                        components: project.components.map(component =>
                            component.id === componentId 
                                ? { ...component, name, quantity, color, hook }
                                : component
                        ),
                        updated: new Date().toISOString()
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            logger.success('Component updated');

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        case ACTIONS.DELETE_COMPONENT: {
            const { projectId, componentId } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const updatedProject = {
                        ...project,
                        components: project.components.filter(c => c.id !== componentId),
                        updated: new Date().toISOString()
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            logger.success('Component deleted');

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        case ACTIONS.ADD_ROUND: {
            const { projectId, componentId, instruction, stitchCount } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const updatedComponents = project.components.map(component => {
                        if (component.id === componentId) {
                            return {
                                ...component,
                                rounds: [...component.rounds, {
                                    id: Date.now().toString(),
                                    roundNumber: component.rounds.length + 1,
                                    instruction,
                                    stitchCount
                                }]
                            };
                        }
                        return component;
                    });

                    const updatedProject = {
                        ...project,
                        components: updatedComponents,
                        updated: new Date().toISOString()
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            logger.success('Round added');

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        case ACTIONS.UPDATE_ROUND: {
            const { projectId, componentId, roundId, instruction, stitchCount } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const updatedProject = {
                        ...project,
                        components: project.components.map(component => {
                            if (component.id === componentId) {
                                return {
                                    ...component,
                                    rounds: component.rounds.map(round =>
                                        round.id === roundId 
                                            ? { ...round, instruction, stitchCount }
                                            : round
                                    )
                                };
                            }
                            return component;
                        }),
                        updated: new Date().toISOString()
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            logger.success('Round updated');

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        case ACTIONS.DELETE_ROUND: {
            const { projectId, componentId, roundId } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const updatedComponents = project.components.map(c => {
                        if (c.id === componentId) {
                            const filteredRounds = c.rounds.filter(r => r.id !== roundId);
                            // Renumber remaining rounds
                            const renumbered = filteredRounds.map((r, index) => ({
                                ...r,
                                roundNumber: index + 1
                            }));
                            return { ...c, rounds: renumbered };
                        }
                        return c;
                    });

                    const updatedProject = {
                        ...project,
                        components: updatedComponents,
                        updated: new Date().toISOString()
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            logger.success('Round deleted');

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        case ACTIONS.INCREMENT_COMPONENT_COMPLETION: {
            const { projectId, componentId } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const updatedProject = {
                        ...project,
                        components: project.components.map(c => {
                            if (c.id === componentId && c.completedCount < c.quantity) {
                                return {
                                    ...c,
                                    completedCount: c.completedCount + 1
                                };
                            }
                            return c;
                        })
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            logger.success('Component completion incremented');

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        case ACTIONS.DECREMENT_COMPONENT_COMPLETION: {
            const { projectId, componentId } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const updatedProject = {
                        ...project,
                        components: project.components.map(c => {
                            if (c.id === componentId && c.completedCount > 0) {
                                return {
                                    ...c,
                                    completedCount: c.completedCount - 1
                                };
                            }
                            return c;
                        })
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            logger.success('Component completion decremented');

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        case ACTIONS.SET_COMPONENT_COMPLETION: {
            const { projectId, componentId, completedCount } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const updatedProject = {
                        ...project,
                        components: project.components.map(c => {
                            if (c.id === componentId) {
                                // Clamp value between 0 and quantity
                                const newCount = Math.max(0, Math.min(completedCount, c.quantity));
                                return {
                                    ...c,
                                    completedCount: newCount
                                };
                            }
                            return c;
                        })
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            logger.success('Component completion set');

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        case ACTIONS.UPDATE_CURRENT_ROUND: {
            const { projectId, componentId, currentRound } = action.payload;

            const updatedProjects = state.projects.map(project => {
                if (project.id === projectId) {
                    const updatedProject = {
                        ...project,
                        components: project.components.map(component =>
                            component.id === componentId 
                                ? { ...component, currentRound }
                                : component
                        )
                    };

                    return updateProjectActivity(updatedProject);
                }
                return project;
            });

            return {
                ...state,
                projects: updatedProjects,
                currentProject: state.currentProject?.id === projectId
                    ? updatedProjects.find(p => p.id === projectId)
                    : state.currentProject
            };
        }

        default:
            logger.warn('Unknown action type', action.type);
            return state;
    }
}

export default projectsReducer;
