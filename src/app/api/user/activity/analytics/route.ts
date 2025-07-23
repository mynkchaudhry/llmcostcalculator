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
    const timeframe = searchParams.get('timeframe') || '30'; // days
    const days = parseInt(timeframe);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all activities for the timeframe
    const activities = await UserActivity.find({
      userId: session.user.id,
      timestamp: { $gte: startDate },
    }).lean();

    // Calculate summary metrics
    const totalActivities = activities.length;
    const uniqueSessions = new Set(activities.map(a => a.metadata?.sessionId).filter(Boolean)).size;
    
    // Activity breakdown by type
    const activityByType: Record<string, number> = {};
    const activityByDay: Record<string, number> = {};
    const hourlyDistribution: Record<string, number> = {};
    
    // Calculator specific metrics
    let totalCalculations = 0;
    let totalEstimations = 0;
    let totalComparisons = 0;
    let totalCostCalculated = 0;
    const modelsUsed = new Set<string>();
    const providersUsed = new Set<string>();

    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toISOString().split('T')[0];
      const hour = new Date(activity.timestamp).getHours();
      
      // Count by type
      activityByType[activity.type] = (activityByType[activity.type] || 0) + 1;
      
      // Count by day
      activityByDay[date] = (activityByDay[date] || 0) + 1;
      
      // Count by hour
      hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      
      // Specific activity metrics
      switch (activity.type) {
        case 'calculator':
          totalCalculations++;
          if (activity.details.calculator) {
            totalCostCalculated += activity.details.calculator.totalCost;
            modelsUsed.add(activity.details.calculator.modelName);
            providersUsed.add(activity.details.calculator.provider);
          }
          break;
        case 'estimator':
          totalEstimations++;
          if (activity.details.estimator) {
            modelsUsed.add(activity.details.estimator.selectedModel.name);
            providersUsed.add(activity.details.estimator.selectedModel.provider);
          }
          break;
        case 'comparison':
          totalComparisons++;
          if (activity.details.comparison) {
            totalCostCalculated += activity.details.comparison.totalCost;
          }
          break;
      }
    });

    // Calculate averages and trends
    const avgActivitiesPerDay = totalActivities / days;
    const avgCostPerCalculation = totalCalculations > 0 ? totalCostCalculated / totalCalculations : 0;
    
    // Most active hour
    const mostActiveHour = Object.entries(hourlyDistribution)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '0';
    
    // Device usage
    const deviceUsage: Record<string, number> = {};
    activities.forEach(activity => {
      if (activity.metadata?.device?.type) {
        deviceUsage[activity.metadata.device.type] = (deviceUsage[activity.metadata.device.type] || 0) + 1;
      }
    });

    // Session duration analysis
    const sessionDurations = activities
      .filter(a => a.metadata?.duration)
      .map(a => a.metadata!.duration!);
    
    const avgSessionDuration = sessionDurations.length > 0 
      ? sessionDurations.reduce((sum, dur) => sum + dur, 0) / sessionDurations.length 
      : 0;

    // Recent activity trend (last 7 days vs previous 7 days)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 7);
    
    const recentActivities = activities.filter(a => new Date(a.timestamp) >= recentDate).length;
    const previousActivities = activities.filter(a => {
      const activityDate = new Date(a.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 14);
      return activityDate >= weekAgo && activityDate < recentDate;
    }).length;
    
    const activityTrend = previousActivities > 0 
      ? ((recentActivities - previousActivities) / previousActivities) * 100 
      : 0;

    return NextResponse.json({
      timeframe: days,
      summary: {
        totalActivities,
        uniqueSessions,
        totalCalculations,
        totalEstimations,
        totalComparisons,
        totalCostCalculated,
        uniqueModelsUsed: modelsUsed.size,
        uniqueProvidersUsed: providersUsed.size,
        avgActivitiesPerDay,
        avgCostPerCalculation,
        avgSessionDuration,
        activityTrend,
      },
      breakdown: {
        activityByType,
        activityByDay,
        hourlyDistribution,
        deviceUsage,
      },
      insights: {
        mostActiveHour,
        topModels: Array.from(modelsUsed).slice(0, 5),
        topProviders: Array.from(providersUsed),
        peakDay: Object.entries(activityByDay)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || null,
      },
    });
  } catch (error: any) {
    console.error('Get activity analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity analytics' },
      { status: 500 }
    );
  }
}