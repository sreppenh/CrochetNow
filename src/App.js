import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectsProvider } from './features/projects/context/ProjectsContext';
import LandingPage from './features/landing/components/LandingPage';
import ProjectsList from './features/projects/components/ProjectsList';
import ProjectDetail from './features/projects/components/ProjectDetail';
import ComponentDetail from './features/components/components/ComponentDetail';
import CrochetMode from './features/crochet-mode/components/CrochetMode';
import './styles/index.css';

function App() {
  return (
    <ProjectsProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/project/:projectId/component/:componentId" element={<ComponentDetail />} />
            <Route path="/project/:projectId/component/:componentId/crochet" element={<CrochetMode />} />
          </Routes>
        </div>
      </Router>
    </ProjectsProvider>
  );
}

export default App;
