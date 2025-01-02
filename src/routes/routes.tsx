import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";

const Home = React.lazy(() => import("../pages/Home"));

const AppRoutes = () => {
  return (
    <Router>
      <Suspense fallback={<div>Chargement...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Add more routes here during development of the project */}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;
