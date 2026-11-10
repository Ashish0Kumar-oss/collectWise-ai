import { NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';

export async function GET() {
  try {
    const activities = await db.getActivities(50);
    return NextResponse.json({ activities });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch activities' }, { status: 500 });
  }
}
