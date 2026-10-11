import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';

import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <Outlet />
      <Toaster position='top-center' />
    </ThemeProvider>
  );
}
