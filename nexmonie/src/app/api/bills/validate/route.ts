
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { accountNumber } = body;

  // Simulate network delay
  await new Promise(r => setTimeout(r, 1000));

  if (accountNumber && accountNumber.length >= 8) {
    return NextResponse.json({
      success: true,
      customerName: "SARAH NICHOLAS",
      address: "12, Elite Command Center, Lagos",
    });
  }

  return NextResponse.json({
    success: false,
    error: "Invalid account or meter number"
  }, { status: 400 });
}
