import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import GitHubProvider from 'next-auth/providers/github';
import User from '@/models/User';
import connectToDatabase from '@/lib/mongodb';
import Groq from 'groq-sdk';

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

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI infrastructure cost advisor. Provide detailed, practical recommendations in 150-200 words.

RULES:
- Target 150-200 words total
- Always start with ## Header
- Provide detailed explanations with context
- Use tables for 2+ options with comprehensive details
- Include 1 YouTube video when directly relevant
- Add pricing links and practical advice

STRUCTURE:
## [Topic]

Detailed explanation of the topic, including key considerations, use cases, and factors that affect decision-making. Provide context about why this matters.

| Service | Cost/Month | Key Features | Best For |
|---------|------------|--------------|----------|
| Option1 | $X-Y | Feature list | Specific use case |
| Option2 | $X-Y | Feature list | Specific use case |

**Analysis:** Compare the options with specific reasons why one might be better.

**Recommendation:** [Service] for [specific reason]. Additional implementation tips. [Pricing Link](url)

YouTube format: YOUTUBE:Title|video_id

YOUTUBE RULES - VERY STRICT:
- ONLY include video if user specifically asks about that exact topic
- Vector DB questions: YOUTUBE:Vector Databases Explained|klTvEwg3oJ4
- RAG questions: YOUTUBE:RAG in 5 Minutes|T-D1OfcDW1M  
- Embedding questions: YOUTUBE:What are Embeddings|d_mrzWOThmk
- Cost optimization questions: YOUTUBE:AI Cost Optimization|BLMjNtIe3CE

DO NOT include videos for:
- General recommendations
- Pricing comparisons
- "Which service" questions
- Implementation questions

ONLY include if user asks "What is [topic]" or "How does [topic] work"`;

interface ChatResponse {
  content: string;
  suggestions: string[];
  videos?: { title: string; videoId: string }[];
  links?: string[];
}

async function generateResponse(messages: any[]): Promise<ChatResponse> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 600,
    });

    let content = completion.choices[0]?.message?.content || "Please try your question again.";

    // Extract YouTube videos - but be very selective
    const videos: { title: string; videoId: string }[] = [];
    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    // Only extract videos if user is asking about concepts, not services/pricing
    const isConceptualQuestion = 
      lastUserMessage.includes('what is') ||
      lastUserMessage.includes('how does') ||
      lastUserMessage.includes('explain') ||
      lastUserMessage.includes('understand');
    
    if (isConceptualQuestion) {
      const youtubePattern = /YOUTUBE:([^|]+)\|([A-Za-z0-9_-]{11})/g;
      let match;
      
      while ((match = youtubePattern.exec(content)) !== null) {
        videos.push({
          title: match[1].trim(),
          videoId: match[2].trim()
        });
      }
    }
    
    // Remove YouTube markers from content
    content = content.replace(/YOUTUBE:[^|]+\|[A-Za-z0-9_-]{11}/g, '').trim();

    // Extract links
    const links: string[] = [];
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    
    while ((linkMatch = linkPattern.exec(content)) !== null) {
      links.push(linkMatch[2]);
    }

    // Clean up extra whitespace
    content = content.replace(/\n\s*\n\s*\n+/g, '\n\n').trim();

    // Simple suggestions
    const suggestions = [
      "Show alternatives",
      "Compare costs", 
      "Best for my scale",
      "Implementation guide"
    ];

    return {
      content,
      suggestions,
      videos: videos.length > 0 ? videos : undefined,
      links: links.length > 0 ? links : undefined
    };

  } catch (error) {
    console.error('Groq API error:', error);
    
    return {
      content: `## AI Infrastructure Options

When choosing AI infrastructure, consider your scale, budget, and technical expertise. The market offers both managed and self-hosted solutions with different cost structures.

| Service | Cost/Month | Key Features | Best For |
|---------|------------|--------------|----------|
| Pinecone | $50-200 | Managed, auto-scaling | Production apps |
| OpenAI | $20-500 | Pre-trained models | Quick deployment |
| Qdrant | $30-150 | High performance | Large datasets |

**Analysis:** Managed services cost more but reduce operational overhead. Self-hosted options provide more control but require DevOps expertise.

**Recommendation:** Start with Pinecone for vector storage and OpenAI for models if you need rapid deployment. [Pinecone Pricing](https://pinecone.io/pricing)`,
      suggestions: ["Compare options", "Show details", "Cost breakdown", "Getting started"]
    };
  }
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

    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages required' },
        { status: 400 }
      );
    }

    const response = await generateResponse(messages);
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}