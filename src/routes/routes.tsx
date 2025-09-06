import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useLocation,
  Location
} from "react-router-dom";
import React, { Suspense, lazy, LazyExoticComponent } from "react";
import { AnimatePresence } from "framer-motion";

type RouteProps = Record<string, never>;

interface AppRoute {
  path: string;
  component: LazyExoticComponent<React.ComponentType<RouteProps>>;
  name: string;
  animated?: boolean;
  meta?: {
    title?: string;
    description?: string;
  };
}

const appRoutes: AppRoute[] = [
  {
    path: "/",
    component: lazy(() => import("../pages/Home")),
    name: "Home",
    animated: true,
    meta: {
      title: "Greg.GS - Portfolio",
      description: "Portfolio de développeur back-end et DevOps"
    }
  },
  {
    path: "/about",
    component: lazy(() => import("../pages/About")),
    name: "About",
    animated: true,
    meta: {
      title: "À Propos - Greg.GS",
      description: "En savoir plus sur mon parcours et mes compétences"
    }
  },
];

const LoadingFallback: React.FC = () => {
  return (
    <div 
      className="loading-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
      }}
      role="status"
      aria-label="Chargement de la page"
    >
      <div className="loading-spinner">
        <span>Chargement...</span>
      </div>
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Route Error:', error, errorInfo);
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div 
          className="error-container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1>Oups ! Une erreur est survenue</h1>
          <p>Nous sommes désolés, la page n'a pas pu se charger.</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#792262',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retour à l'accueil
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AnimatedRoutes: React.FC = () => {
  const location: Location = useLocation();

  React.useEffect(() => {
    const currentRoute = appRoutes.find(route => route.path === location.pathname);
    if (currentRoute?.meta?.title) {
      document.title = currentRoute.meta.title;
    }
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {appRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RouteErrorBoundary>
                <route.component />
              </RouteErrorBoundary>
            }
          />
        ))}
        {/* Route 404 */}
        <Route
          path="*"
          element={
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                textAlign: 'center',
              }}
            >
              <h1>404 - Page non trouvée</h1>
              <p>La page que vous recherchez n'existe pas.</p>
              <a 
                href="/" 
                style={{
                  marginTop: '1rem',
                  color: '#792262',
                  textDecoration: 'underline',
                }}
              >
                Retour à l'accueil
              </a>
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatedRoutes />
      </Suspense>
    </Router>
  );
};

export default AppRoutes;
