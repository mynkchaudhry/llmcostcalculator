import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import GitHubProvider from 'next-auth/providers/github';
import User from '@/models/User';
import connectToDatabase from '@/lib/mongodb';
import Groq from 'groq-sdk';
import { LinkupClient } from 'linkup-sdk';
import env from '@/lib/env';

const authOptions = {
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
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
  secret: env.NEXTAUTH_SECRET,
};

// Initialize Groq client
const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
});

// Initialize Linkup client
const linkupClient = new LinkupClient({
  apiKey: env.LINKUP_API_KEY || '',
});
const ENHANCED_SYSTEM_PROMPT = `You are an **AI Solutions and Cost Advisor and senior consultant** with deep expertise in:

- AI infrastructure costs
- AI model hosting
- Vector databases
- GPU providers
- Model providers
- Cost optimization techniques
- AI architecture
- AI model selection (open-source and API-based)
- Vector databases
- GPU provider platforms
- Model provider platforms
- Retrieval-Augmented Generation (RAG)
- you know about all the latest AI infrastructure options and their costs in 2025 
- all the ai and ml algorithms and their implementations
**Instructions:**

1. **Start each section with a clear \`## Header\`**
2. **Use markdown tables for comparisons**
3. **Give short, clear answers (max 80 words per section)**
4. **Add relevant YouTube videos only when helpful**  
   Format: \`YOUTUBE:[Title]|[VideoID]\`
5. **Include pricing links** for tools/platforms
6. **End with a recommendation:**  
   \`**For [specific service]**, it's best for [use case]. See [pricing](link).\`
7. **Ask for clarification** if needed  
   *(e.g., "What’s your primary use case—chatbot, summarization, document QA, etc.?")*

**Example response:**

## Vector Database Options
| Service   | Monthly Cost | Key Feature          |
|-----------|--------------|----------------------|
| Pinecone  | $50–200      | Managed & scalable   |
| Qdrant    | $30–150      | Fast local filtering |
| Weaviate  | $0–200+      | Built-in ML support  |

**For Qdrant**, it's best for budget-friendly, local RAG setups. See [pricing](https://qdrant.tech/pricing).

YOUTUBE:Vector Database Explained|klTvEwg3oJ4`;

// Removed unused formatEnhancedPromptContent function

function fixMarkdownFormatting(content: string): string {
  let fixed = content;

  // Ensure proper spacing around headers
  fixed = fixed.replace(/(#{1,6}\s*[^\n]+)\n([^#\n\s])/g, '$1\n\n$2');
  
  // Ensure proper spacing before and after tables
  fixed = fixed.replace(/([^\n])\n(\|[^|\n]*\|)/g, '$1\n\n$2');
  fixed = fixed.replace(/(\|[^|\n]*\|)\n([^|\n\s])/g, '$1\n\n$2');
  
  // Clean up excessive blank lines
  fixed = fixed.replace(/\n\s*\n\s*\n+/g, '\n\n');
  
  // Trim each line
  fixed = fixed.split('\n').map(line => line.trim()).join('\n');
  
  return fixed.trim();
}

// Removed unused formattedPrompt variable and console.log


// Web search function using Linkup
async function performLinkupSearch(query: string): Promise<{ content: string; sources: any[] }> {
  try {
    const searchResult = await linkupClient.search({
      query: `${query} AI infrastructure costs pricing comparison 2024`,
      depth: 'deep',
      outputType: 'sourcedAnswer',
    });

    // Extract content and sources from Linkup response
    const content = searchResult.answer || '';
    const sources = searchResult.sources || [];

    return {
      content,
      sources
    };
  } catch (error) {
    console.error('Linkup search error:', error);
    return {
      content: '',
      sources: []
    };
  }
}

// Generate response using Groq API with web search integration
const generateGroqResponse = async (messages: any[]): Promise<{ content: string; suggestions?: string[]; costEstimate?: any[]; links?: string[]; videos?: { title: string; videoId: string }[] }> => {
  try {
    // Get the latest user message for search
    const userMessage = messages[messages.length - 1]?.content || '';
    
    // Perform Linkup search for current information
    const linkupResults = await performLinkupSearch(userMessage);
    
    // Format search results for LLM context
    const searchContext = linkupResults.content || linkupResults.sources.length > 0
      ? `\n\nCURRENT WEB SEARCH RESULTS (via Linkup):\n
${linkupResults.content ? `ANSWER: ${linkupResults.content}\n\n` : ''}
SOURCES:\n${linkupResults.sources.map((source, index) => 
          `${index + 1}. ${source.title || source.name || 'Source'}\n   ${source.snippet || source.description || ''}\n   URL: ${source.url}\n`
        ).join('\n')}\n`
      : '';

    // Enhanced system prompt with search context
    const enhancedPrompt = `${ENHANCED_SYSTEM_PROMPT}

IMPORTANT: Use the current web search results below to provide up-to-date pricing and information. The Linkup search has already analyzed current sources and provided a comprehensive answer.
${searchContext}

Instructions for using search results:
- Incorporate the Linkup answer and sources into your response
- Reference current pricing from the sources
- Include links to the sources you mention  
- Mention that information is from recent sources (2024)
- Combine your knowledge with the current search results`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: enhancedPrompt },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 600, // Increased for more detailed responses
    });

    let content = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    // Generate simple suggestions
    let suggestions: string[] = [
      "Compare costs",
      "Show alternatives", 
      "How to scale?",
      "Implementation help"
    ];

    // Extract cost estimates if present in the response (enhanced parsing)
    let costEstimate: any[] = [];
    
    // Look for pricing patterns like "$X per query", "$X/month", "$X monthly"
    const pricingPatterns = [
      /(\w+).*?\$(\d+(?:\.\d{2})?)\s*(?:per month|\/month|monthly)/gi,
      /(\w+).*?\$(\d+(?:\.\d{2})?)\s*(?:per query|\/query)/gi,
      /\$(\d+(?:\.\d{2})?)\s*(?:per month|\/month|monthly).*?(\w+)/gi
    ];
    
    for (const pattern of pricingPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null && costEstimate.length < 3) {
        const service = match[1] || match[2] || 'Service';
        const cost = parseFloat(match[2] || match[1]);
        
        if (!isNaN(cost)) {
          // Convert per-query pricing to monthly estimate (assuming 10k queries/month)
          const monthlyCost = pattern.source.includes('query') ? cost * 10000 : cost;
          
          costEstimate.push({
            service: service.charAt(0).toUpperCase() + service.slice(1),
            monthlyCost: monthlyCost,
            description: pattern.source.includes('query') ? 
              `Estimated for 10k queries/month at $${cost} per query` : 
              `Monthly pricing`
          });
        }
      }
    }

    // Extract links from markdown content and search results
    let links: string[] = [];
    const linkMatches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (linkMatches && linkMatches.length > 0) {
      links = linkMatches.map(match => {
        const urlMatch = match.match(/\(([^)]+)\)/);
        return urlMatch ? urlMatch[1] : '';
      }).filter(url => url.length > 0);
    }
    
    // Add Linkup source URLs as additional links
    if (linkupResults.sources.length > 0) {
      const sourceLinks = linkupResults.sources
        .slice(0, 3) // Top 3 sources
        .map(source => source.url)
        .filter(url => url && !links.includes(url));
      links = [...links, ...sourceLinks];
    }

    // Extract YouTube videos - handle multiple formats
    let videos: { title: string; videoId: string }[] = [];
    
    // Pattern to match: YOUTUBE: Title | videoId or YOUTUBE:Title|videoId
    const youtubePattern = /YOUTUBE:\s*([^|\n]+?)\s*\|\s*([A-Za-z0-9_-]+)/gi;
    
    const matches = Array.from(content.matchAll(youtubePattern));
    
    if (matches.length > 0) {
      videos = matches.map(match => {
        const title = match[1]?.trim() || 'Educational Video';
        const videoId = match[2]?.trim() || '';
        
        return { title, videoId };
      }).filter(video => 
        video.videoId.length >= 10 && // YouTube IDs are typically 11 chars, but allow some flexibility
        /^[A-Za-z0-9_-]+$/.test(video.videoId) // Valid YouTube ID characters only
      );
      
      // Remove all YOUTUBE: lines from content for cleaner display
      content = content.replace(/YOUTUBE:\s*[^|\n]+?\s*\|\s*[A-Za-z0-9_-]+/gi, '');
      
      // Clean up any resulting empty lines or extra whitespace
      content = content.replace(/\n\s*\n\s*\n+/g, '\n\n'); // Remove triple+ line breaks
      content = content.replace(/^\s+|\s+$/gm, ''); // Trim each line
      content = content.replace(/^\n+|\n+$/g, ''); // Remove leading/trailing newlines
    }

    // Fix common formatting issues in the content
    content = fixMarkdownFormatting(content);

    return {
      content,
      suggestions: suggestions.slice(0, 4), // Limit to 4 suggestions
      costEstimate: costEstimate.length > 0 ? costEstimate : undefined,
      links: links.length > 0 ? links : undefined,
      videos: videos.length > 0 ? videos : undefined
    };

  } catch (error) {
    console.error('Groq API error:', error);
    
    // Get userMessage for fallback
    const fallbackUserMessage = messages[messages.length - 1]?.content || 'AI infrastructure pricing';
    
    // Fallback response with Linkup search attempt
    const fallbackLinkupResults = await performLinkupSearch(fallbackUserMessage);
    const fallbackLinks = fallbackLinkupResults.sources.map(source => source.url).filter(url => url);
    
    return {
      content: `## AI Infrastructure Options ${fallbackLinkupResults.sources.length > 0 ? '(with current Linkup search)' : ''}

${fallbackLinkupResults.content ? `### Current Market Information\n${fallbackLinkupResults.content}\n\n` : ''}

### Vector Databases
- **Pinecone**: $50-200/month, managed scaling
- **Qdrant**: $30-150/month, fast local filtering  
- **Weaviate**: $40-180/month, open-source ML

### Model Hosting
- **Groq**: Ultra-fast inference
- **OpenAI**: Reliable, comprehensive APIs

${fallbackLinkupResults.sources.length > 0 ? `\n**Latest information**: Check the sources below for current pricing and updates.` : 'For current pricing, please try your question again.'}`,
      suggestions: [
        "Compare vector database costs",
        "Show model hosting options", 
        "Recommend architecture",
        "Self-hosted vs managed"
      ],
      links: fallbackLinks.length > 0 ? fallbackLinks : [],
      videos: []
    };
  }
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

    const { messages } = await request.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get the last user message
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    // Generate response using Groq API
    const response = await generateGroqResponse(messages);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}