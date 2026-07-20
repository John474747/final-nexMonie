
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { qrData } = await request.json();

  // Simulate decoding delay
  await new Promise(r => setTimeout(r, 1200));

  // Mock merchant database lookup
  const merchants: Record<string, any> = {
    'MERC-001': {
      merchantName: "SHOPRITE LAGOS",
      merchantId: "SR-7729-LG",
      merchantLogo: "S",
      currency: "NGN",
      type: "dynamic",
      amount: 12500,
      description: "Grocery Purchase at Ikeja Mall"
    },
    'MERC-STATIC': {
      merchantName: "ELITE BISTRO",
      merchantId: "EB-9912-VI",
      merchantLogo: "E",
      currency: "NGN",
      type: "static",
      amount: null,
      description: "Payment for Dining"
    }
  };

  const data = merchants[qrData] || merchants['MERC-001'];

  return NextResponse.json({
    success: true,
    ...data
  });
}
