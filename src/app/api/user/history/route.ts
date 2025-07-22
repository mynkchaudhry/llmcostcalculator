import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { models, inputTokens, outputTokens, totalCost } = await request.json();
    
    const historyEntry = {
      models,
      inputTokens,
      outputTokens,
      totalCost,
      timestamp: new Date(),
    };

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $push: { 
          'preferences.comparisonHistory': {
            $each: [historyEntry],
            $position: 0, // Add to beginning
            $slice: 50 // Keep only last 50 entries
          }
        }
      },
      { new: true }
    ).select('preferences.comparisonHistory');

    return NextResponse.json({
      message: 'Comparison saved to history',
      history: updatedUser?.preferences?.comparisonHistory
    });
  } catch (error: any) {
    console.error('Save history error:', error);
    return NextResponse.json(
      { error: 'Failed to save comparison history' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const user = await User.findById(session.user.id)
      .select('preferences.comparisonHistory')
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      history: user.preferences?.comparisonHistory || [] 
    });
  } catch (error: any) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison history' },
      { status: 500 }
    );
  }
}