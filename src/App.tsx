/* Cấu tạo ô tô điện — Dự án của Chí Hiếu — 2026 */
import { useRef, useState } from 'react';
import { AboutDialog } from './components/AboutDialog';
import { Credits } from './components/Credits';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Scene } from './components/Scene';
import type { DetailId } from './lib/sceneMachine';

export default function App() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [activeScene, setActiveScene] = useState<'overview' | DetailId>('overview');
  const [isAppearanceVisible, setIsAppearanceVisible] = useState(false);
  const aboutOpenerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpenAbout = (triggerEl: HTMLButtonElement) => {
    aboutOpenerRef.current = triggerEl;
    setIsAboutOpen(true);
  };

  const handleCloseAbout = () => {
    setIsAboutOpen(false);
  };

  return (
    <div className="app-shell">
      <Header onOpenAbout={handleOpenAbout} />

      <Scene
        isAboutOpen={isAboutOpen}
        onActiveSceneChange={setActiveScene}
        onAppearanceVisibilityChange={setIsAppearanceVisible}
        onRequestCloseAbout={handleCloseAbout}
      />

      <Footer
        activeScene={activeScene}
        hiddenForAppearance={isAppearanceVisible && activeScene === 'overview'}
      />

      <Credits onOpenAbout={handleOpenAbout} />

      <AboutDialog
        isOpen={isAboutOpen}
        openerElement={aboutOpenerRef.current}
        onClose={handleCloseAbout}
      />
    </div>
  );
}
