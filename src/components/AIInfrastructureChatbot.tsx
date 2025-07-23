'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { 
  Send, 
  MessageSquare, 
  Trash2, 
  Copy,
  Check,
  Database,
  Cloud,
  DollarSign,
  Cpu,
  RefreshCw,
  Plus,
  ExternalLink,
  Play,
  Video
} from 'lucide-react';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import ConfirmDialog from './ui/ConfirmDialog';
import { formatCurrency } from '@/utils/formatting';
import { fadeInUp, stagger } from '@/utils/animations';

// Import highlight.js CSS for code syntax highlighting
import 'highlight.js/styles/github-dark.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  costEstimate?: {
    service: string;
    monthlyCost: number;
    description: string;
  }[];
  links?: string[];
  videos?: {
    title: string;
    videoId: string;
  }[];
}

interface ChatSession {
  id: string;
  messages: Message[];
  title: string;
  createdAt: Date;
}

const INITIAL_SUGGESTIONS = [
  "Help me choose a vector database for semantic search",
  "I need to build a RAG chatbot - what's the best architecture?",
  "Compare costs: OpenAI vs self-hosted models",
  "What's the most cost-effective embedding solution?",
  "I have 10k daily queries - recommend an infrastructure",
  "How much would it cost to build a recommendation system?"
];

// YouTube Player Component
const YouTubePlayer = ({ videoId, title }: { videoId: string; title: string }) => {
  const [hasError, setHasError] = useState(false);

  const handleIframeError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
        <div className="flex items-center space-x-2 mb-3">
          <Video className="h-4 w-4 text-red-400" />
          <span className="text-sm font-medium text-red-400">Educational Video</span>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm">Video temporarily unavailable</p>
          <a 
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm underline mt-2 inline-block"
          >
            Watch on YouTube
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-2 truncate">{title}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
      <div className="flex items-center space-x-2 mb-3">
        <Video className="h-4 w-4 text-red-400" />
        <span className="text-sm font-medium text-red-400">Educational Video</span>
      </div>
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&iv_load_policy=3`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0"
          onError={handleIframeError}
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
          Watch
        </a>
      </div>
    </div>
  );
};

export default function AIInfrastructureChatbot() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    sessionId: string | null;
    sessionTitle: string;
  }>({ isOpen: false, sessionId: null, sessionTitle: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { logActivity } = useActivityLogger();
  
  // Pagination state
  const [sessionsPage, setSessionsPage] = useState(1);
  const [messagesPage, setMessagesPage] = useState(1);
  const sessionsPerPage = 10;
  const messagesPerPage = 20;

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Pagination calculations
  const paginatedSessions = sessions.slice(
    (sessionsPage - 1) * sessionsPerPage,
    sessionsPage * sessionsPerPage
  );
  const totalSessionPages = Math.ceil(sessions.length / sessionsPerPage);
  
  const paginatedMessages = currentSession?.messages.slice(
    (messagesPage - 1) * messagesPerPage,
    messagesPage * messagesPerPage
  ) || [];
  const totalMessagePages = Math.ceil((currentSession?.messages.length || 0) / messagesPerPage);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // Reset messages pagination when switching sessions
  useEffect(() => {
    setMessagesPage(1);
  }, [currentSessionId]);

  // Go to last page when new message is added
  useEffect(() => {
    if (currentSession) {
      const lastPage = Math.ceil(currentSession.messages.length / messagesPerPage);
      setMessagesPage(lastPage);
    }
  }, [currentSession?.messages.length, messagesPerPage]);

  // Load chat history from database
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!session?.user?.id) return;
      
      setIsLoadingHistory(true);
      try {
        const response = await fetch('/api/chat-history');
        if (response.ok) {
          const data = await response.json();
          const loadedSessions = data.chatHistory.map((chat: any) => ({
            id: chat.sessionId,
            messages: chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })),
            title: chat.title,
            createdAt: new Date(chat.createdAt)
          }));
          setSessions(loadedSessions);
          
          // Set current session to the most recent one if exists
          if (loadedSessions.length > 0) {
            setCurrentSessionId(loadedSessions[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [session?.user?.id]);

  // Save chat session to database
  const saveChatSession = async (sessionId: string, messages: Message[], title?: string) => {
    if (!session?.user?.id) return;

    try {
      await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages,
          title
        })
      });
    } catch (error) {
      console.error('Failed to save chat session:', error);
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      messages: [],
      title: 'New Conversation',
      createdAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const updateSessionTitle = (sessionId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, title }
        : session
    ));
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Create session if none exists
    if (!currentSessionId) {
      createNewSession();
      setTimeout(() => sendMessage(content), 100);
      return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add user message
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId 
        ? { ...session, messages: [...session.messages, userMessage] }
        : session
    ));

    // Update session title if this is the first message
    const session = sessions.find(s => s.id === currentSessionId);
    if (session && session.messages.length === 0) {
      updateSessionTitle(currentSessionId, content);
    }

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...(session?.messages.map(m => ({ role: m.role, content: m.content })) || []),
            { role: 'user', content: content }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        suggestions: data.suggestions,
        costEstimate: data.costEstimate,
        links: data.links,
        videos: data.videos,
      };

      const updatedMessages = [...(session?.messages || []), userMessage, assistantMessage];

      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: updatedMessages }
          : session
      ));

      // Save to database
      await saveChatSession(currentSessionId, updatedMessages, session?.title);

      // Log chatbot interaction
      logActivity({
        type: 'chatbot',
        action: 'ai_infrastructure_query',
        details: {
          chatbot: {
            sessionId: currentSessionId,
            userQuery: content,
            responseLength: data.content.length,
            hasCostEstimate: !!data.costEstimate,
            suggestionCount: data.suggestions?.length || 0,
            linkCount: data.links?.length || 0,
            videoCount: data.videos?.length || 0,
          }
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [...session.messages, errorMessage] }
          : session
      ));
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
      console.error('Failed to copy message:', error);
    }
  };

  const handleDeleteSessionClick = (sessionId: string, sessionTitle: string) => {
    setDeleteDialog({ isOpen: true, sessionId, sessionTitle });
  };

  const handleDeleteSessionConfirm = async () => {
    if (!deleteDialog.sessionId) return;
    
    try {
      await fetch(`/api/chat-history?sessionId=${deleteDialog.sessionId}`, {
        method: 'DELETE'
      });
      
      setSessions(prev => prev.filter(s => s.id !== deleteDialog.sessionId));
      if (currentSessionId === deleteDialog.sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== deleteDialog.sessionId);
        setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeleteDialog({ isOpen: false, sessionId: null, sessionTitle: '' });
    }
  };

  const handleDeleteSessionCancel = () => {
    setDeleteDialog({ isOpen: false, sessionId: null, sessionTitle: '' });
  };

  const clearCurrentSession = () => {
    if (currentSessionId) {
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { ...session, messages: [] }
          : session
      ));
      // Save empty session to database
      saveChatSession(currentSessionId, [], currentSession?.title);
    }
  };

  // Initialize with a session if none exists and not loading
  useEffect(() => {
    if (!isLoadingHistory && sessions.length === 0) {
      createNewSession();
    }
  }, [isLoadingHistory, sessions.length]);

  if (isLoadingHistory) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="flex items-center justify-center h-[400px]"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading chat history...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="flex h-[calc(100vh-12rem)] max-h-[800px] gap-4"
    >
      {/* Sidebar - Session History */}
      <motion.div variants={fadeInUp} className="w-72 flex-shrink-0">
        <GlassCard className="h-full p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Conversations
            </h3>
          </div>
          
          <div className="flex-1 space-y-2 overflow-hidden">
            {paginatedSessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  currentSessionId === session.id
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setCurrentSessionId(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.messages.length} messages
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSessionClick(session.id, session.title);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sessions Pagination */}
          {totalSessionPages > 1 && (
            <div className="flex justify-center items-center space-x-2 p-2 border-t border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSessionsPage(prev => Math.max(1, prev - 1))}
                disabled={sessionsPage === 1}
                className="text-xs"
              >
                ←
              </Button>
              <span className="text-xs text-gray-500">
                {sessionsPage}/{totalSessionPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSessionsPage(prev => Math.min(totalSessionPages, prev + 1))}
                disabled={sessionsPage === totalSessionPages}
                className="text-xs"
              >
                →
              </Button>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div variants={fadeInUp} className="flex-1 flex flex-col">
        <GlassCard className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar type="assistant" size="md" animate={true} />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI Infrastructure Advisor
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get personalized recommendations for your AI infrastructure
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={createNewSession} title="New Chat">
                  <Plus className="h-4 w-4" />
                  New Chat
                </Button>
                {currentSession && currentSession.messages.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCurrentSession}>
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Messages Container - Fixed height with scroll */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
            {currentSession?.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl inline-block mb-4">
                    <div className="flex items-center space-x-2">
                      <Database className="h-8 w-8 text-blue-400" />
                      <Cloud className="h-8 w-8 text-purple-400" />
                      <Cpu className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome to AI Infrastructure Advisor
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    I&apos;ll help you choose the best AI infrastructure for your project and estimate costs. 
                    Ask me about vector databases, model hosting, embeddings, and more!
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                  {INITIAL_SUGGESTIONS.map((suggestion, index) => (
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
                      {/* Avatar */}
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
                                  prose-headings:text-gray-100 prose-headings:mb-8 prose-headings:mt-10 prose-headings:font-semibold prose-headings:first:mt-0
                                  prose-h2:text-lg prose-h3:text-base prose-h2:border-b prose-h2:border-gray-600 prose-h2:pb-4 prose-h2:mb-8 prose-h2:mt-10
                                  prose-h3:mb-6 prose-h3:mt-8
                                  prose-p:text-gray-300 prose-p:mb-6 prose-p:leading-relaxed prose-p:text-sm
                                  prose-strong:text-gray-200 prose-strong:font-semibold
                                  prose-code:text-blue-300 prose-code:bg-blue-500/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                                  prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-gray-600 prose-pre:rounded-lg prose-pre:mb-8 prose-pre:mt-6
                                  prose-blockquote:border-l-blue-400 prose-blockquote:text-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:mb-8 prose-blockquote:mt-6
                                  prose-ul:text-gray-300 prose-ul:mb-6 prose-ul:mt-4 prose-ul:space-y-2 prose-ol:text-gray-300 prose-ol:mb-6 prose-ol:mt-4 prose-ol:space-y-2
                                  prose-li:text-gray-300 prose-li:text-sm prose-li:leading-relaxed prose-li:mb-2
                                  prose-table:text-gray-300 prose-table:mb-10 prose-table:mt-8 prose-table:border-collapse prose-table:w-full
                                  prose-th:text-gray-200 prose-th:font-semibold prose-th:text-xs prose-th:uppercase prose-th:tracking-wide prose-th:py-4 prose-th:px-4
                                  prose-td:text-gray-300 prose-td:text-sm prose-td:py-4 prose-td:px-4 prose-td:border-b prose-td:border-gray-700/50
                                  prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300 prose-a:font-medium">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                    components={{
                                      // Custom table styling with enhanced formatting
                                      table: ({children}) => (
                                        <div className="overflow-x-auto my-8 bg-gray-800/30 border border-gray-600 rounded-lg">
                                          <table className="min-w-full border-collapse">
                                            {children}
                                          </table>
                                        </div>
                                      ),
                                      thead: ({children}) => (
                                        <thead className="bg-gray-700/70">
                                          {children}
                                        </thead>
                                      ),
                                      th: ({children}) => (
                                        <th className="px-6 py-4 border-b-2 border-gray-600 text-left font-bold text-gray-100 text-sm uppercase tracking-wider bg-gray-700/50">
                                          {children}
                                        </th>
                                      ),
                                      td: ({children}) => (
                                        <td className="px-6 py-4 border-b border-gray-700/50 text-gray-300 text-sm leading-relaxed">
                                          {children}
                                        </td>
                                      ),
                                      tbody: ({children}) => (
                                        <tbody className="divide-y divide-gray-700/30 bg-gray-800/20">
                                          {children}
                                        </tbody>
                                      ),
                                      // Custom header styling with better spacing
                                      h2: ({children}) => (
                                        <div className="mt-8 mb-6 first:mt-0">
                                          <h2 className="text-lg font-semibold text-gray-100 pb-3 border-b border-gray-600">
                                            {children}
                                          </h2>
                                        </div>
                                      ),
                                      h3: ({children}) => (
                                        <div className="mt-6 mb-4">
                                          <h3 className="text-base font-semibold text-gray-100">
                                            {children}
                                          </h3>
                                        </div>
                                      ),
                                      // Custom paragraph styling for better separation
                                      p: ({children}) => (
                                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                          {children}
                                        </p>
                                      ),
                                      // Custom list styling with better spacing
                                      ul: ({children}) => (
                                        <div className="my-4">
                                          <ul className="space-y-2 ml-4 list-disc list-outside">
                                            {children}
                                          </ul>
                                        </div>
                                      ),
                                      ol: ({children}) => (
                                        <div className="my-4">
                                          <ol className="space-y-2 ml-4 list-decimal list-outside">
                                            {children}
                                          </ol>
                                        </div>
                                      ),
                                      li: ({children}) => (
                                        <li className="text-gray-300 text-sm leading-relaxed pl-1">
                                          {children}
                                        </li>
                                      ),
                                      // Custom link styling
                                      a: ({href, children}) => (
                                        <a 
                                          href={href} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-blue-400 hover:text-blue-300 underline font-medium inline-flex items-center gap-1 transition-colors"
                                        >
                                          {children}
                                          <ExternalLink className="h-3 w-3 opacity-70" />
                                        </a>
                                      ),
                                      // Custom code block styling
                                      code: ({node, inline, className, children, ...props}) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                          <div className="relative">
                                            <pre className="bg-gray-800/70 border border-gray-600 rounded-lg p-4 overflow-x-auto" {...props}>
                                              <code className={className}>{children}</code>
                                            </pre>
                                          </div>
                                        ) : (
                                          <code className="bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded" {...props}>
                                            {children}
                                          </code>
                                        );
                                      }
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                              )}
                              
                              
                              {/* Cost Estimates */}
                              {message.costEstimate && message.costEstimate.length > 0 && (
                                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <DollarSign className="h-4 w-4 text-green-400" />
                                    <span className="text-sm font-medium text-green-400">Cost Estimate</span>
                                  </div>
                                  <div className="space-y-2">
                                    {message.costEstimate.map((estimate, index) => (
                                      <div key={index} className="flex justify-between items-center text-sm">
                                        <span>{estimate.service}</span>
                                        <span className="font-semibold text-green-400">
                                          {formatCurrency(estimate.monthlyCost)}/month
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
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
                              
                              {/* Suggestions */}
                              {message.suggestions && message.suggestions.length > 0 && (
                                <div className="mt-4 space-y-2">
                                  <p className="text-sm text-gray-500">Continue with:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {message.suggestions.map((suggestion, index) => (
                                      <button
                                        key={index}
                                        onClick={() => sendMessage(suggestion)}
                                        className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-full text-xs transition-colors"
                                        disabled={isLoading}
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMessage(message.content, message.id)}
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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

          {/* Messages Pagination */}
          {currentSession && totalMessagePages > 1 && (
            <div className="flex justify-between items-center p-3 border-t border-white/10 bg-white/5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMessagesPage(prev => Math.max(1, prev - 1))}
                disabled={messagesPage === 1}
              >
                ← Previous
              </Button>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Page {messagesPage} of {totalMessagePages}
                </span>
                <span className="text-xs text-gray-600">
                  Showing {((messagesPage - 1) * messagesPerPage) + 1} to {Math.min(messagesPage * messagesPerPage, currentSession.messages.length)} of {currentSession.messages.length} messages
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMessagesPage(prev => Math.min(totalMessagePages, prev + 1))}
                disabled={messagesPage === totalMessagePages}
              >
                Next →
              </Button>
            </div>
          )}

          {/* Input - Fixed at bottom */}
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about AI infrastructure, costs, or architecture recommendations..."
                  disabled={isLoading}
                  className="w-full rounded-2xl border-0 bg-white/10 backdrop-blur-md px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50"
                />
              </div>
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

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteSessionCancel}
        onConfirm={handleDeleteSessionConfirm}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${deleteDialog.sessionTitle}"? This action cannot be undone and all messages in this conversation will be lost.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
}