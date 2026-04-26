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
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <a href="/" className="brand">
            <span className="brand-small">the</span>
            <span className="brand-large">TETE</span>
          </a>
          <span className="admin-badge">CMS</span>
        </div>

        <nav className="admin-sidebar-nav">
          <a href="/edit" className="admin-nav-item active">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Projects
          </a>
          <a href="/" className="admin-nav-item" target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            View Site
          </a>
        </nav>

        <div className="admin-sidebar-footer">
          <form action={logout}>
            <button type="submit" className="admin-logout-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h1>Content Manager</h1>
          <p>Manage your portfolio projects</p>
        </header>
        <div className="admin-content">
          <EditProjects initialProjects={projects} />
        </div>
      </main>
    </div>
  );
}
