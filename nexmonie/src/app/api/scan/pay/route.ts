
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Simulate payment processing
  await new Promise(r => setTimeout(r, 2000));

  // 97% success rate for simulation
  const isSuccess = Math.random() > 0.03;

  if (isSuccess) {
    return NextResponse.json({
      success: true,
      transactionId: 'QR-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      timestamp: new Date().toISOString(),
    });
  } else {
    return NextResponse.json({
      success: false,
      error: 'Transaction declined by merchant network. Please try again.'
    }, { status: 500 });
  }
}
