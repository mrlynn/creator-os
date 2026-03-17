import { Box } from '@mui/material';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AppSidebar, SIDEBAR_WIDTH } from '@/components/shared-ui/AppSidebar';
import { ToastProvider } from '@/components/shared-ui/Toast';
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
    <ThemeProvider>
      <ToastProvider>
        <Box
          sx={{
            display: 'flex',
            minHeight: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <AppSidebar />
          <Box
            component="main"
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 3,
              ml: `${SIDEBAR_WIDTH}px`,
            }}
          >
            {children}
          </Box>
        </Box>
      </ToastProvider>
    </ThemeProvider>
  );
}
