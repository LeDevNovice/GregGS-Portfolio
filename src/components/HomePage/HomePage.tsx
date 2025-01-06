import HomePageBackground from "./HomePageBackground";
import HomePageFooter from "./HomePageFooter";
import HomePageMenu from "./HomePageMenu";
import HomePageSocials from "./HomePageSocials";
import HomePageTitle from "./HomePageTitle";

const HomePage = () => {
  return (
    <div className="homepage">
      <HomePageTitle />
      <HomePageBackground />
      <HomePageSocials />
      <HomePageMenu />
      <HomePageFooter />
    </div>
  );
}

export default HomePage;