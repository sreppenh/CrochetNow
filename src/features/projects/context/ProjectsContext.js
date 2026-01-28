/**
 * Projects Context
 * Global state management for CrochetGenius using React Context
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { projectsReducer, initialState, ACTIONS } from '../hooks/projectsReducer';
import storage from '../../../shared/utils/storage';
import logger from '../../../shared/utils/logger';

const ProjectsContext = createContext();

export function ProjectsProvider({ children }) {
    const [state, dispatch] = useReducer(projectsReducer, initialState);

    // Load projects from storage on mount
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const projects = await storage.getProjects();
                dispatch({ type: ACTIONS.LOAD_PROJECTS, payload: projects });
                logger.success('Projects loaded', { count: projects.length });
            } catch (error) {
                logger.error('Failed to load projects', error);
            }
        };

        loadProjects();
    }, []);

    // Save projects to storage whenever they change
    useEffect(() => {
        if (state.projects.length >= 0) {
            storage.saveProjects(state.projects).catch(error => {
                logger.error('Failed to save projects', error);
            });
        }
    }, [state.projects]);

    return (
        <ProjectsContext.Provider value={{ state, dispatch }}>
            {children}
        </ProjectsContext.Provider>
    );
}

// Custom hook to use projects context
export function useProjects() {
    const context = useContext(ProjectsContext);
    
    if (!context) {
        throw new Error('useProjects must be used within ProjectsProvider');
    }
    
    return context;
}

export default ProjectsContext;
