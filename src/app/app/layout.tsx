import { AppLayoutClient } from '@/components/shared-ui/AppLayoutClient';
import { ToastProvider } from '@/components/shared-ui/Toast';
import { GlobalSearchProvider } from '@/components/shared-ui/GlobalSearchContext';
import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <ToastProvider>
      <GlobalSearchProvider>
        <AppLayoutClient>{children}</AppLayoutClient>
      </GlobalSearchProvider>
    </ToastProvider>
  );
}
