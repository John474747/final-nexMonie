import { NextResponse } from 'next/server';

const MOCK_BANKS = [
  { id: '1', name: 'Access Bank' },
  { id: '2', name: 'Zenith Bank' },
  { id: '3', name: 'Guaranty Trust Bank (GTB)' },
  { id: '4', name: 'First Bank of Nigeria' },
  { id: '5', name: 'United Bank for Africa (UBA)' },
  { id: '6', name: 'Moniepoint MFB' },
  { id: '7', name: 'OPay' },
  { id: '8', name: 'Kuda Microfinance Bank' },
  { id: '9', name: 'PalmPay' },
  { id: '10', name: 'Standard Chartered' },
  { id: '11', name: 'Fidelity Bank' },
  { id: '12', name: 'Union Bank' },
  { id: '13', name: 'Stanbic IBTC' },
  { id: '14', name: 'Wema Bank' },
  { id: '15', name: 'Sterling Bank' },
  { id: '16', name: 'Polaris Bank' },
  { id: '17', name: 'Providus Bank' },
  { id: '18', name: 'VFD Microfinance Bank' },
];

export async function GET() {
  return NextResponse.json(MOCK_BANKS);
}
