import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import GitHubProvider from 'next-auth/providers/github';
import User from '@/models/User';
import ChatHistory from '@/models/ChatHistory';
import connectToDatabase from '@/lib/mongodb';

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

// GET - Fetch chat history for user
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

    const chatHistory = await ChatHistory.find({ 
      userId: session.user.id,
      isActive: true 
    })
    .sort({ updatedAt: -1 })
    .limit(50); // Limit to last 50 sessions

    return NextResponse.json({ chatHistory });
  } catch (error: any) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

// POST - Save or update chat session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId, title, messages } = await request.json();

    if (!sessionId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Session ID and messages array are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if session exists
    const existingSession = await ChatHistory.findOne({ sessionId });

    if (existingSession) {
      // Update existing session
      existingSession.messages = messages;
      existingSession.title = title || existingSession.title;
      existingSession.updatedAt = new Date();
      await existingSession.save();

      return NextResponse.json({ 
        success: true,
        chatHistory: existingSession 
      });
    } else {
      // Create new session
      const newChatHistory = new ChatHistory({
        userId: session.user.id,
        sessionId,
        title: title || 'New Conversation',
        messages,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });

      await newChatHistory.save();

      return NextResponse.json({ 
        success: true,
        chatHistory: newChatHistory 
      });
    }
  } catch (error: any) {
    console.error('Save chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to save chat history' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chat session
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Soft delete - mark as inactive
    await ChatHistory.findOneAndUpdate(
      { sessionId, userId: session.user.id },
      { isActive: false, updatedAt: new Date() }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat history' },
      { status: 500 }
    );
  }
}