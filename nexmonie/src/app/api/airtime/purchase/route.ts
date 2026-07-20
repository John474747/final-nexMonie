
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { phoneNumber, network, amount } = body;

  if (!phoneNumber || !network || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 98% success rate for simulation
  const isSuccess = Math.random() > 0.02;

  if (isSuccess) {
    return NextResponse.json({
      success: true,
      transactionId: 'AIR-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      timestamp: new Date().toISOString(),
    });
  } else {
    return NextResponse.json({
      success: false,
      error: 'Network provider timeout. Please try again later.',
    }, { status: 500 });
  }
}
