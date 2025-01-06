import { useState } from 'react';
import IntroOverlay from './../components/IntroOverlay/IntroOverlay';
import HomePage from '../components/HomePage/HomePage';

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      <HomePage />
      {showIntro && (
        <IntroOverlay 
          onFinish={() => setShowIntro(false)} 
        />
      )}
    </>
  );
}
