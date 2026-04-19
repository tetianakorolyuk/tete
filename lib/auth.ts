'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tete2025';

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin_auth');
  return authCookie?.value === 'authenticated';
}

export async function login(formData: FormData): Promise<void> {
  const password = formData.get('password') as string;

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    redirect('/edit');
  }

  redirect('/edit/login?error=invalid');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_auth');
  redirect('/');
}
