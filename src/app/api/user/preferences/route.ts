import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

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
    
    const user = await User.findById(session.user.id).select('preferences').lean();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ preferences: user.preferences });
  } catch (error: any) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const preferences = await request.json();
    
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: { 
          preferences: {
            ...preferences,
            comparisonHistory: preferences.comparisonHistory || [],
          }
        }
      },
      { new: true }
    ).select('preferences');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}