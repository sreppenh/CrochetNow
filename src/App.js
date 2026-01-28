import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectsProvider } from './features/projects/context/ProjectsContext';
import LandingPage from './features/landing/components/LandingPage';
import ProjectsList from './features/projects/components/ProjectsList';
import ProjectDetail from './features/projects/components/ProjectDetailNew';
import ComponentDetail from './features/components/components/ComponentDetail';
import CrochetMode from './features/crochet-mode/components/CrochetMode';
import WakeLockBanner from './shared/components/WakeLockBanner';
import './styles/index.css';

function App() {
  const wakeLockRef = useRef(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const wakeLockStatus = localStorage.getItem('crochetnow_wakelock_activated');

    /**
     * Attempt to acquire wake lock
     */
    const attemptWakeLock = async () => {
      if (!('wakeLock' in navigator)) {
        return false;
      }

      if (wakeLockRef.current !== null) {
        return true; // Already active
      }

      try {
        const wakeLock = await navigator.wakeLock.request('screen');
        console.log('✅ Wake lock activated');
        wakeLockRef.current = wakeLock;
        wakeLock.addEventListener('release', () => {
          console.log('Wake lock released');
          wakeLockRef.current = null;
        });
        return true;
      } catch (err) {
        console.log(`Wake lock failed: ${err.name}`);
        return false;
      }
    };

    /**
     * Activate wake lock on ANY user interaction
     */
    const activateOnInteraction = () => {
      attemptWakeLock().then(success => {
        if (success) {
          localStorage.setItem('crochetnow_wakelock_activated', 'true');
          document.removeEventListener('click', activateOnInteraction);
          document.removeEventListener('touchstart', activateOnInteraction);
          document.removeEventListener('scroll', activateOnInteraction);
        }
      });
    };

    if (!wakeLockStatus) {
      // First time user - show banner to explain what will happen
      setTimeout(() => setShowBanner(true), 500);
    } else if (wakeLockStatus === 'true') {
      // Returning user - activate on first interaction
      document.addEventListener('click', activateOnInteraction, { once: true });
      document.addEventListener('touchstart', activateOnInteraction, { once: true });
      document.addEventListener('scroll', activateOnInteraction, { once: true });
    }

    // Re-acquire wake lock when switching back to app
    const handleVisibilityChange = async () => {
      const wakeLockStatus = localStorage.getItem('crochetnow_wakelock_activated');

      if (document.visibilityState === 'visible' && wakeLockStatus === 'true') {
        if (wakeLockRef.current === null && 'wakeLock' in navigator) {
          try {
            const wakeLock = await navigator.wakeLock.request('screen');
            console.log('✅ Wake lock re-acquired on app switch');
            wakeLockRef.current = wakeLock;
            wakeLock.addEventListener('release', () => {
              wakeLockRef.current = null;
            });
          } catch (err) {
            console.log('Failed to re-acquire:', err.name);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Release wake lock on unmount
      if (wakeLockRef.current !== null) {
        wakeLockRef.current.release().catch(console.error);
      }
    };
  }, []);

  const handleWakeLockSuccess = () => {
    console.log('🎉 Wake lock successfully activated');
  };

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

          {/* Wake lock activation banner - shows when needed */}
          {showBanner && (
            <WakeLockBanner
              wakeLockRef={wakeLockRef}
              onSuccess={handleWakeLockSuccess}
            />
          )}
        </div>
      </Router>
    </ProjectsProvider>
  );
}

export default App;
