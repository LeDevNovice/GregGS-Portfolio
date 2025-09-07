import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import React, { Suspense } from 'react'

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

export const Route = createRootRoute({
  component: () => (
    <RouteErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
      <TanStackRouterDevtools />
    </RouteErrorBoundary>
  ),
  notFoundComponent: () => {
    return (
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
    )
  },
})