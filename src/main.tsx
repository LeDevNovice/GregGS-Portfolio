import { StrictMode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

import './index.css';

const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent'
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const initializeApp = (): void => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    const errorMessage = 'Critical error : root element not found';
    console.error(errorMessage);
    
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: sans-serif;
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        padding: 20px;
        text-align: center;
      ">
        <div>
          <h1>Error when loading</h1>
          <p>${errorMessage}</p>
          <p>Please refresh</p>
        </div>
      </div>
    `;
    
    throw new Error(errorMessage);
  }

  const root: Root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
};

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  console.error('Promise rejected not handled :', event.reason);
});

window.addEventListener('error', (event: ErrorEvent) => {
  console.error('Global error :', event.error);
});

try {
  initializeApp();
} catch (error) {
  console.error('Application initialization failed : ', error);
}