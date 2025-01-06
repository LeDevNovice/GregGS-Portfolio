import '../../styles/HomePage.css';

function HomePageTitle() {
  return (
    <section className="homepage__title">
      <h1 className='homepage__title-name'>
        GREG<span className="homepage__title-purple">.</span>GS
      </h1>
      <h1 className='homepage__title-job'>
        DEV BACK-END / DEVOPS<span className="homepage__title-purple">.</span>JS
      </h1>
      <div className='homepage__title-border'></div>
    </section>
  );
}

export default HomePageTitle;
