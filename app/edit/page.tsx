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
      <header className="edit-header">
        <div className="edit-header-inner">
          <div>
            <h1>Content Manager</h1>
            <p>Manage your portfolio projects</p>
          </div>
          <div className="edit-header-actions">
            <a href="/">View Site</a>
            <form action={logout} style={{ display: 'inline' }}>
              <button type="submit" className="edit-logout-btn">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="edit-main">
        <EditProjects initialProjects={projects} />
      </main>
    </div>
  );
}
