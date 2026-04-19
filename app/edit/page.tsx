import { checkAuth, logout } from '@/lib/auth';
import { getProjects } from '@/lib/content';
import { redirect } from 'next/navigation';
import EditProjects from './EditProjects';

export default async function EditPage() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/edit/login');
  }

  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--line2)] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light font-[Roboto Slab]">Content Manager</h1>
            <p className="text-sm text-[var(--muted)]">Manage your portfolio projects</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm uppercase tracking-wider underline">
              View Site
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="px-4 py-2 border border-[var(--line)] bg-white text-sm uppercase tracking-wider hover:border-[var(--accent)]"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <EditProjects initialProjects={projects} />
      </main>
    </div>
  );
}
