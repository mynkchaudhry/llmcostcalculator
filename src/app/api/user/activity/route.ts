import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import UserActivity from '@/models/UserActivity';
import GitHubProvider from 'next-auth/providers/github';
import User from '@/models/User';

const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        await connectToDatabase();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            githubId: profile?.id,
          });
        }
        return true;
      } catch (error) {
        console.error('GitHub sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token.email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: token.email });
          if (dbUser) {
            session.user.id = dbUser._id.toString();
          }
        } catch (error) {
          console.error('Session callback error:', error);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to extract device info from user agent
function parseUserAgent(userAgent: string) {
  const device = {
    type: 'desktop' as 'desktop' | 'mobile' | 'tablet',
    os: '',
    browser: '',
  };

  // Detect mobile/tablet
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    device.type = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
  }

  // Detect OS
  if (/Windows/.test(userAgent)) device.os = 'Windows';
  else if (/Mac/.test(userAgent)) device.os = 'macOS';
  else if (/Linux/.test(userAgent)) device.os = 'Linux';
  else if (/Android/.test(userAgent)) device.os = 'Android';
  else if (/iOS/.test(userAgent)) device.os = 'iOS';

  // Detect browser
  if (/Chrome/.test(userAgent)) device.browser = 'Chrome';
  else if (/Firefox/.test(userAgent)) device.browser = 'Firefox';
  else if (/Safari/.test(userAgent)) device.browser = 'Safari';
  else if (/Edge/.test(userAgent)) device.browser = 'Edge';

  return device;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { type, action, details, duration } = await request.json();
    
    // Validate required fields
    if (!type || !action) {
      return NextResponse.json(
        { error: 'Type and action are required' },
        { status: 400 }
      );
    }

    // Extract metadata from request
    const userAgent = request.headers.get('user-agent') || '';
    const device = parseUserAgent(userAgent);
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    const activityEntry = await UserActivity.create({
      userId: session.user.id,
      type,
      action,
      details: details || {},
      metadata: {
        userAgent,
        ipAddress,
        device,
        duration: duration || undefined,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      message: 'Activity logged successfully',
      activityId: activityEntry._id,
    });
  } catch (error: any) {
    console.error('Log activity error:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId: session.user.id };
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      UserActivity.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserActivity.countDocuments(query),
    ]);

    return NextResponse.json({ 
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      // Clear all activities for the user
      await UserActivity.deleteMany({ userId: session.user.id });
      return NextResponse.json({ 
        message: 'All activities cleared successfully',
      });
    }

    if (!activityId) {
      return NextResponse.json(
        { error: 'Activity ID is required' },
        { status: 400 }
      );
    }

    const result = await UserActivity.findOneAndDelete({
      _id: activityId,
      userId: session.user.id,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Activity deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete activity error:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}