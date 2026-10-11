import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';

import { AppStateProvider } from '@/app-state';
import { SiteFooter } from '@/components/site-footer';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <HeadContent />
      <AppStateProvider>
        <Outlet />
      </AppStateProvider>
      <SiteFooter />
      <Toaster
        position='bottom-center'
        mobileOffset={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      />
    </ThemeProvider>
  );
}
