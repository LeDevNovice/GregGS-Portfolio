import HomePageBackground from "./HomePageBackground";
import HomePageFooter from "./HomePageFooter";
import HomePageSocials from "./HomePageSocials";
import HomePageTitle from "./HomePageTitle";

const HomePage = () => {
  return (
    <div className="homepage">
      <HomePageTitle />
      <HomePageBackground />
      <HomePageSocials />
      <HomePageFooter />
    </div>
  );
}

export default HomePage;