'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  MessageSquare,
  Copy,
  Check,
  Video,
  ExternalLink
} from 'lucide-react';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import { fadeInUp } from '@/utils/animations';

// Import highlight.js CSS
import 'highlight.js/styles/github-dark.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  videos?: { title: string; videoId: string }[];
  links?: string[];
}

const QUICK_SUGGESTIONS = [
  "Best vector database for RAG chatbot?",
  "Compare OpenAI vs local models cost",
  "Cheapest embedding solution?",
  "How much for 10k daily queries?",
  "Pinecone vs Qdrant pricing",
  "Self-hosted vs managed costs"
];

const YouTubePlayer = ({ videoId, title }: { videoId: string; title: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Video className="h-4 w-4 text-red-400" />
          <span className="text-sm font-medium text-red-400">Video unavailable</span>
        </div>
        <a 
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm underline"
        >
          Watch on YouTube: {title}
        </a>
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
      <div className="flex items-center space-x-2 mb-3">
        <Video className="h-4 w-4 text-blue-400" />
        <span className="text-sm font-medium text-blue-400">Educational Video</span>
      </div>
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0"
          onError={() => setHasError(true)}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-gray-400 truncate flex-1">{title}</p>
        <a 
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 ml-2 flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          YouTube
        </a>
      </div>
    </div>
  );
};

export default function SimpleChatbot() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 20;
  
  // Pagination calculations
  const totalPages = Math.ceil(messages.length / messagesPerPage);
  const paginatedMessages = messages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Go to last page when new message is added
  useEffect(() => {
    const lastPage = Math.ceil(messages.length / messagesPerPage);
    setCurrentPage(lastPage || 1);
  }, [messages.length, messagesPerPage]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session?.user?.id) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: content }
          ]
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        videos: data.videos,
        links: data.links,
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="max-w-4xl mx-auto"
    >
      <GlassCard className="h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Avatar type="assistant" size="md" animate={true} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Infrastructure Advisor
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get cost-effective recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  AI Infrastructure Advisor
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                  Ask me about vector databases, AI models, costs, and infrastructure recommendations.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    className="p-3 text-left bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm text-gray-300 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {paginatedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <Avatar 
                      type={message.role} 
                      size="md" 
                      animate={false} 
                      userImage={session?.user?.image || undefined}
                      userName={session?.user?.name || undefined}
                    />
                    
                    <div className="flex-1">
                      <div className={`p-4 rounded-2xl group ${
                        message.role === 'user'
                          ? 'bg-blue-500/20 text-gray-100'
                          : 'bg-white/5 text-gray-300'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {message.role === 'assistant' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none 
                                prose-headings:text-gray-100 prose-headings:mb-4 prose-headings:mt-6 prose-headings:font-semibold prose-headings:first:mt-0
                                prose-h2:text-lg prose-h2:border-b prose-h2:border-gray-600 prose-h2:pb-2 prose-h2:mb-4
                                prose-p:text-gray-300 prose-p:mb-4 prose-p:leading-relaxed prose-p:text-sm
                                prose-strong:text-gray-200 prose-strong:font-semibold
                                prose-table:text-gray-300 prose-table:mb-6 prose-table:mt-4
                                prose-th:text-gray-200 prose-th:font-semibold prose-th:text-xs prose-th:uppercase prose-th:py-3 prose-th:px-4
                                prose-td:text-gray-300 prose-td:text-sm prose-td:py-3 prose-td:px-4
                                prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    table: ({children}) => (
                                      <div className="overflow-x-auto my-4 bg-gray-800/30 border border-gray-600 rounded-lg">
                                        <table className="min-w-full border-collapse">
                                          {children}
                                        </table>
                                      </div>
                                    ),
                                    thead: ({children}) => (
                                      <thead className="bg-gray-700/50">
                                        {children}
                                      </thead>
                                    ),
                                    th: ({children}) => (
                                      <th className="px-4 py-3 border-b border-gray-600 text-left font-semibold text-gray-200 text-sm">
                                        {children}
                                      </th>
                                    ),
                                    td: ({children}) => (
                                      <td className="px-4 py-3 border-b border-gray-700/50 text-gray-300 text-sm">
                                        {children}
                                      </td>
                                    ),
                                    a: ({href, children}) => (
                                      <a 
                                        href={href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                                      >
                                        {children}
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    ),
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap break-words">{message.content}</div>
                            )}
                            
                            {/* YouTube Videos */}
                            {message.videos && message.videos.length > 0 && (
                              <div className="space-y-3">
                                {message.videos.map((video, index) => (
                                  <YouTubePlayer
                                    key={index}
                                    videoId={video.videoId}
                                    title={video.title}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content, message.id)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1 px-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex space-x-3 max-w-[85%]">
                    <Avatar type="assistant" size="md" animate={true} />
                    <div className="flex-1">
                      <div className="p-4 rounded-2xl bg-white/5">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-gray-400 text-sm">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-3 border-t border-white/10 bg-white/5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </Button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-xs text-gray-600">
                Showing {((currentPage - 1) * messagesPerPage) + 1} to {Math.min(currentPage * messagesPerPage, messages.length)} of {messages.length} messages
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next →
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about AI infrastructure, costs, or recommendations..."
              disabled={isLoading}
              className="flex-1 rounded-2xl border-0 bg-white/10 backdrop-blur-md px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </GlassCard>
    </motion.div>
  );
}