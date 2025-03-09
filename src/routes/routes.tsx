import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React, { Suspense } from "react";
import { AnimatePresence } from "framer-motion";

const Home = React.lazy(() => import("../pages/Home"));
const About = React.lazy(() => import("../pages/About"));

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <Suspense fallback={<div>Chargement...</div>}>
        <AnimatedRoutes />
      </Suspense>
    </Router>
  );
};

export default AppRoutes;
