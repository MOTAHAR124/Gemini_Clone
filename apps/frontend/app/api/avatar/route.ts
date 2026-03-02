import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'lh3.googleusercontent.com',
  'googleusercontent.com',
  'www.google.com',
  'profiles.google.com',
]);

function isAllowedHost(hostname: string): boolean {
  if (ALLOWED_HOSTS.has(hostname)) {
    return true;
  }
  return hostname.endsWith('.googleusercontent.com');
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get('url');
  if (!target) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (parsed.protocol !== 'https:' || !isAllowedHost(parsed.hostname)) {
    return NextResponse.json({ error: 'Blocked url' }, { status: 400 });
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Avatar fetch failed' }, { status: 502 });
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Avatar fetch failed' }, { status: 502 });
  }
}

