import { checkAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Dashboard from './Dashboard';

export default async function DashboardPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/edit/login');
  }
  return <Dashboard />;
}
