import { useState } from "react";
import { useNavigate } from "react-router-dom";

import HomePageBackground from "./HomePageBackground";
import HomePageFooter from "./HomePageFooter";
import HomePageMenu from "./HomePageMenu";
import HomePageSocials from "./HomePageSocials";
import HomePageTitle from "./HomePageTitle";

const HomePage = () => {
  const navigate = useNavigate();
  const [startFadeOut, setStartFadeOut] = useState(false);
  const [startBgAnimation, setStartBgAnimation] = useState(false);

  const handleNavigate = () => {
    setStartFadeOut(true);
    setTimeout(() => setStartBgAnimation(true), 750);
    setTimeout(() => navigate('/about'), 5000);
  };

  return (
    <div className="homepage">
      <HomePageTitle animateExit={startFadeOut} />
      <HomePageSocials animateExit={startFadeOut} />
      <HomePageMenu animateExit={startFadeOut} onAboutClick={handleNavigate} />
      <HomePageFooter animateExit={startFadeOut} />
      <HomePageBackground animateExit={startBgAnimation} />
    </div>
  );
}

export default HomePage;
