import { useState } from "react";
import { useNavigate } from "react-router-dom";

import HomePageBackground from "./HomePageBackground";
import HomePageFooter from "./HomePageFooter";
import HomePageMenu from "./HomePageMenu";
import HomePageSocials from "./HomePageSocials";
import HomePageTitle from "./HomePageTitle";

const HomePage = () => {
  const navigate = useNavigate();
  const [startTransition, setStartTransition] = useState(false);

  const handleNavigate = () => {
    setStartTransition(true);
    setTimeout(() => navigate('/about'), 1600);
  };

  return (
    <div className="homepage">
      <HomePageTitle animateExit={startTransition} />
      <HomePageSocials animateExit={startTransition} />
      <HomePageMenu animateExit={startTransition} onAboutClick={handleNavigate} />
      <HomePageFooter animateExit={startTransition} />
      <HomePageBackground animateExit={startTransition} />
    </div>
  );
}

export default HomePage;
