import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'app', 'data', 'books.json'); 
let books = [];

try {
  books = JSON.parse(fs.readFileSync(dataPath, 'utf8')).books;
} catch (e) {
  console.warn('Could not read books.json', e);
}

export async function GET(request) {
  const url = new URL(request.url);
  const pathname = url.pathname; 
  // Query param example for top-rated or date range
  const sp = url.searchParams;

  // top-rated -> /api/books?top=true
  if (sp.get('top') === 'true') {
    const top = books.slice().sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount)).slice(0, 10);
    return NextResponse.json(top);
  }

  // date range -> /api/books?start=YYYY-MM-DD&end=YYYY-MM-DD
  const start = sp.get('start');
  const end = sp.get('end');
  if (start && end) {
    const filtered = books.filter(b => b.datePublished >= start && b.datePublished <= end);
    return NextResponse.json(filtered);
  }

  return NextResponse.json(books);
}

export async function POST(request) {
  const body = await request.json();
  if (!body || !body.title || !body.author) {
    return NextResponse.json({ message: 'Missing title or author' }, { status: 400 });
  }
  // In serverless environment we generally don't write to file; for demo return the created object
  const newId = String(books.reduce((m, b) => Math.max(m, Number(b.id)), 0) + 1);
  const newBook = { ...body, id: newId, rating: body.rating || 0, reviewCount: body.reviewCount || 0, featured: !!body.featured };
  // For local dev you could write to file. Here we just return created book.
  return NextResponse.json(newBook, { status: 201 });
}
