import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, estimatedDuration, sharedWith } = body;

    // Input validation
    if (!destination || !estimatedDuration || !sharedWith?.length) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const walkId = `walk_${Date.now()}`;

   

    return NextResponse.json({
      success: true,
      id: walkId,
      destination,
      estimatedDuration,
      startTime: new Date().toISOString(),
      status: 'active',
    });
  } catch (error) {
    console.error('Start walk error:', error);
    return NextResponse.json(
      { error: 'Failed to start walk' },
      { status: 500 }
    );
  }
}
