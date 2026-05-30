import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const RAILWAY_BASE   = 'https://agent.digitalsucces.tech';
const ADMIN_PASSWORD = process.env.AGENT_ADMIN_PASSWORD || 'GplusDigital2026!';
const ADMIN_COOKIE   = 'gdigital_admin';

async function checkAuth() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === 'authenticated';
}

export async function GET(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const path = req.nextUrl.searchParams.get('path') || '';
  try {
    const res = await fetch(`${RAILWAY_BASE}/${path}`, {
      headers: { 'x-admin-password': ADMIN_PASSWORD },
      next: { revalidate: 0 },
    });
    if (!res.ok) return NextResponse.json({ error: `Railway ${res.status}` }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Impossible de joindre Railway' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const path = req.nextUrl.searchParams.get('path') || '';
  const body = await req.json();
  try {
    const res = await fetch(`${RAILWAY_BASE}/${path}`, {
      method: 'POST',
      headers: { 'x-admin-password': ADMIN_PASSWORD, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `Railway ${res.status}` }));
      return NextResponse.json(err, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Impossible de joindre Railway' }, { status: 502 });
  }
}
