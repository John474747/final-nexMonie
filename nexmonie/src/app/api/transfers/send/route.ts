
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Simulate processing delay
  await new Promise(r => setTimeout(r, 2000));

  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    return NextResponse.json({
      success: true,
      transactionId: 'TRF-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      timestamp: new Date().toISOString(),
    });
  } else {
    return NextResponse.json({
      success: false,
      error: 'Transfer declined by bank network. Please try again.'
    }, { status: 500 });
  }
}
