
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { phoneNumber, network, planId, amount } = body;

  if (!phoneNumber || !network || !planId || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Simulate heavy processing
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 95% success rate for simulation
  const success = Math.random() > 0.05;

  if (success) {
    return NextResponse.json({
      success: true,
      transactionId: 'TX' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      timestamp: new Date().toISOString(),
    });
  } else {
    return NextResponse.json({
      success: false,
      error: 'Insufficient vendor balance or technical error',
    }, { status: 500 });
  }
}
