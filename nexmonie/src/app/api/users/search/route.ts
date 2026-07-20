
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) return NextResponse.json([]);

  // Mock search results
  const users = [
    { id: 'user1', displayName: 'Sarah Nicholas', username: 'sarah_n', photoURL: 'https://picsum.photos/seed/1/200' },
    { id: 'user2', displayName: 'John Doe', username: 'johndoe', photoURL: 'https://picsum.photos/seed/2/200' },
    { id: 'user3', displayName: 'Elite Member', username: 'elite_one', photoURL: '' },
  ].filter(u => 
    u.displayName.toLowerCase().includes(query.toLowerCase()) || 
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json(users);
}
