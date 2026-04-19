import { login, checkAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    redirect('/edit');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light font-[Roboto Slab] mb-2">tete</h1>
          <p className="text-[var(--muted)] text-sm uppercase tracking-wider">Admin Login</p>
        </div>

        {searchParams.error && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 text-red-700 text-sm">
            Invalid password. Please try again.
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-3 border border-[var(--line)] bg-white focus:outline-none focus:border-[var(--accent)]"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[var(--accent)] text-white uppercase tracking-wider text-sm hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-xs text-[var(--muted)] text-center">
          <a href="/" className="underline">← Back to site</a>
        </p>
      </div>
    </div>
  );
}
