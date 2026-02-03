import { NextRequest, NextResponse } from 'next/server';

/**
 * Helper endpoint to verify your Paystack plan configuration
 * This will list all your plans and help you find the correct plan code
 */
export async function GET(request: NextRequest) {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: 'PAYSTACK_SECRET_KEY not configured' },
        { status: 500 }
      );
    }

    const planCode = process.env.PAYSTACK_SUBSCRIPTION_PLAN_CODE?.trim();

    // Fetch all plans from Paystack
    const plansResponse = await fetch('https://api.paystack.co/plan', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const plansData = await plansResponse.json();

    if (!plansData.status) {
      return NextResponse.json(
        {
          error: 'Failed to fetch plans from Paystack',
          details: plansData.message,
        },
        { status: 400 }
      );
    }

    const plans = plansData.data || [];
    const configuredPlan = planCode
      ? plans.find((p: any) => p.plan_code === planCode)
      : null;

    return NextResponse.json({
      configuredPlanCode: planCode || 'NOT SET',
      planFound: !!configuredPlan,
      configuredPlan: configuredPlan
        ? {
            plan_code: configuredPlan.plan_code,
            name: configuredPlan.name,
            amount: configuredPlan.amount,
            interval: configuredPlan.interval,
            status: configuredPlan.status,
          }
        : null,
      allPlans: plans.map((p: any) => ({
        plan_code: p.plan_code,
        name: p.name,
        amount: p.amount,
        interval: p.interval,
        status: p.status,
      })),
      apiKeyMode: process.env.PAYSTACK_SECRET_KEY.startsWith('sk_test_')
        ? 'TEST'
        : process.env.PAYSTACK_SECRET_KEY.startsWith('sk_live_')
        ? 'LIVE'
        : 'UNKNOWN',
    });
  } catch (error) {
    console.error('Error verifying plan:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

