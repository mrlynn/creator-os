import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { LandingPage } from '@/components/landing/LandingPage';

export default async function Home() {
  const session = await getServerSession();
  if (session) redirect('/app/dashboard');
  return <LandingPage />;
}
