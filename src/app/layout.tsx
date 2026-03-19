import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import { Box } from '@mui/material';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Footer } from '@/components/shared-ui/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'Creator OS',
  description: 'AI-powered content creation for anyone. Transform ideas into scripts, publish across YouTube, TikTok, and more—all in one place.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className={inter.className}>
        <ThemeProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box component="main" sx={{ flex: 1 }}>{children}</Box>
            <Footer />
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
