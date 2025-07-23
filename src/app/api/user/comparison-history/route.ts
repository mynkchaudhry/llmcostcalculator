import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import UserHistory from '@/models/UserHistory';
import { CostCalculation } from '@/types';
import NextAuth from 'next-auth';
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
    
    const { comparisons, title, description, tags } = await request.json();
    
    console.log('Received data:', { comparisons, title, description, tags });
    
    // Validate comparisons
    if (!comparisons || !Array.isArray(comparisons) || comparisons.length === 0) {
      return NextResponse.json(
        { error: 'Invalid comparisons data' },
        { status: 400 }
      );
    }
    
    // Calculate metadata
    const totalInputTokens = comparisons.reduce((sum: number, comp: CostCalculation) => sum + (comp.inputTokens || 0), 0);
    const totalOutputTokens = comparisons.reduce((sum: number, comp: CostCalculation) => sum + (comp.outputTokens || 0), 0);
    const totalCost = comparisons.reduce((sum: number, comp: CostCalculation) => sum + (comp.totalCost || 0), 0);
    const costs = comparisons.map((comp: CostCalculation) => comp.totalCost || 0);
    const lowestCostModel = comparisons.find((comp: CostCalculation) => comp.totalCost === Math.min(...costs))?.model?.name || '';
    const highestCostModel = comparisons.find((comp: CostCalculation) => comp.totalCost === Math.max(...costs))?.model?.name || '';
    const averageCost = comparisons.length > 0 ? totalCost / comparisons.length : 0;

    const historyEntry = await UserHistory.create({
      userId: session.user.id,
      comparisons: comparisons.map((comp: CostCalculation) => ({
        modelId: comp.model.id,
        modelName: comp.model.name,
        provider: comp.model.provider,
        inputTokens: comp.inputTokens,
        outputTokens: comp.outputTokens,
        inputCost: comp.inputCost,
        outputCost: comp.outputCost,
        totalCost: comp.totalCost,
        contextWindow: comp.model.contextWindow,
        features: comp.model.features,
      })),
      metadata: {
        title,
        description,
        tags,
        totalInputTokens,
        totalOutputTokens,
        totalCost,
        lowestCostModel,
        highestCostModel,
        averageCost,
      },
    });

    return NextResponse.json({
      message: 'Comparison saved to history',
      historyId: historyEntry._id,
    });
  } catch (error: any) {
    console.error('Save comparison history error:', error);
    return NextResponse.json(
      { error: 'Failed to save comparison history' },
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      UserHistory.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserHistory.countDocuments({ userId: session.user.id }),
    ]);

    return NextResponse.json({ 
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get comparison history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comparison history' },
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
    const historyId = searchParams.get('id');

    if (!historyId) {
      return NextResponse.json(
        { error: 'History ID is required' },
        { status: 400 }
      );
    }

    const result = await UserHistory.findOneAndDelete({
      _id: historyId,
      userId: session.user.id,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'History entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'History entry deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete comparison history error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comparison history' },
      { status: 500 }
    );
  }
}