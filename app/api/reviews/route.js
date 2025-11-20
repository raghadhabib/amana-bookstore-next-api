// app/api/reviews/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'app', 'data', 'reviews.json'); // adjust if necessary
let reviews = [];

try {
  reviews = JSON.parse(fs.readFileSync(dataPath, 'utf8')).reviews;
} catch (e) {
  console.warn('Could not read reviews.json', e);
}

export async function GET(request) {
  // optional bookId filter: /api/reviews?bookId=1
  const url = new URL(request.url);
  const bookId = url.searchParams.get('bookId');
  if (bookId) {
    const filtered = reviews.filter(r => r.bookId === bookId);
    return NextResponse.json(filtered);
  }
  return NextResponse.json(reviews);
}

export async function POST(request) {
  const body = await request.json();
  if (!body || !body.bookId || !body.author || !body.rating) {
    return NextResponse.json({ message: 'Missing bookId, author, or rating' }, { status: 400 });
  }
  const newReview = { ...body, id: `review-${Date.now()}`, timestamp: new Date().toISOString(), verified: body.verified || false };
  return NextResponse.json(newReview, { status: 201 });
}
