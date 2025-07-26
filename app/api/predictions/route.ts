import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { date, start, close, weights } = await request.json();

    // Validate required fields
    if (!date || start === undefined || close === undefined || !weights) {
      return NextResponse.json(
        { error: 'Missing required fields (date, start, close, and weights are required)' },
        { status: 400 }
      );
    }

    // Get the latest record for this date to calculate high/low
    const latestRecord = await prisma.prediction.findFirst({
      where: {
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate high and low based on the latest record or use current close as fallback
    const high = latestRecord ? Math.max(start, close, latestRecord.high) : Math.max(start, close);
    const low = latestRecord ? Math.min(start, close, latestRecord.low) : Math.min(start, close);

    // Create or update prediction for the given date
    const prediction = await prisma.prediction.upsert({
      where: { date: new Date(date) },
      update: {
        high,
        low,
        start,
        close,
        weights,
      },
      create: {
        date: new Date(date),
        high,
        low,
        start,
        close,
        weights,
      },
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error saving prediction:', error);
    return NextResponse.json(
      { error: 'Failed to save prediction' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const predictions = await prisma.prediction.findMany({
      orderBy: {
        date: 'desc',
      },
      take: 30, // Get the last 30 predictions
    });

    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
