import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/repository';
import { isPayPalConfigured } from '@/lib/paypal/client';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export async function GET() {
  try {
    const profile = await db.getProfile();
    const businessProfile = await db.getBusinessProfile();

    return NextResponse.json({
      profile,
      businessProfile,
      status: {
        supabaseConfigured: isSupabaseConfigured(),
        paypalConfigured: isPayPalConfigured(),
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
        paypalEnv: process.env.PAYPAL_ENV || 'sandbox',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.businessProfile) {
      await db.updateBusinessProfile(body.businessProfile);
    }

    if (body.profile) {
      await db.updateProfile(body.profile);
    }

    const profile = await db.getProfile();
    const businessProfile = await db.getBusinessProfile();

    return NextResponse.json({
      success: true,
      profile,
      businessProfile,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update settings' }, { status: 500 });
  }
}
