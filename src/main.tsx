import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree, scrollRestoration: true });

declare module '@tanstack/react-router' {
  // biome-ignore lint/style/useConsistentTypeDefinitions: 宣言マージには interface が必要
  interface Register {
    router: typeof router;
  }
}

// iOS Safari は touchstart のリスナーがないと :active を適用しないため、押している間にボタンの見た目が変わらない
document.addEventListener('touchstart', () => undefined, { passive: true });

const rootElement = document.getElementById('root');

if (rootElement !== null) {
  createRoot(rootElement).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
