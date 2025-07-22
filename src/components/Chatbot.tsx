'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  RotateCcw,
  Minimize2
} from 'lucide-react';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Welcome! I'm here to help with your LLM pricing questions.

Ask me about:
- 💰 Model pricing and cost comparisons
- 📊 Usage estimates and calculations
- 🔍 Finding the right model for your needs
- 💡 Tips for cost optimization

What would you like to know?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const predefinedResponses: Record<string, string> = {
    'pricing': 'I can help you compare pricing across different LLM providers. Use the calculator above to get detailed cost breakdowns for your specific usage patterns.',
    'cost': 'Costs vary significantly between providers. Generally, input tokens are cheaper than output tokens. Check the comparison table for current pricing.',
    'recommendation': 'For cost-effective solutions, consider:\n- OpenAI GPT-3.5 for general tasks\n- Claude for complex reasoning\n- Local models for privacy-sensitive work\n\nWhat\'s your specific use case?',
    'help': 'I can assist with:\n- Understanding LLM pricing models\n- Comparing different providers\n- Estimating costs for your usage\n- Finding the best model for your needs\n\nWhat specific question do you have?',
    'hello': 'Hello! I\'m here to help with your LLM pricing questions. What would you like to know?',
    'hi': 'Hi there! How can I help you with LLM pricing today?'
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Check for keyword matches
    for (const [keyword, response] of Object.entries(predefinedResponses)) {
      if (input.includes(keyword)) {
        return response;
      }
    }
    
    // Default response
    return `Thanks for your question about "${userInput}". For detailed pricing information, please use the calculator above or check our comparison tools. I can help with general questions about LLM costs and recommendations.`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Simulate thinking time
    setTimeout(() => {
      const response = generateResponse(userMessage);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Welcome back! How can I help you with LLM pricing today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Don't render chatbot if user is not logged in
  if (!session) {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button - Fixed Position */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageCircle className="h-6 w-6 text-white" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-6 z-40 w-[400px] h-[500px] max-h-[calc(100vh-8rem)] max-w-[calc(100vw-3rem)]"
          >
            <GlassCard className="h-full flex flex-col p-0 overflow-hidden">
              {/* Header */}
              <div className="p-3 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-600/10 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                        LLM Assistant
                      </h3>
                      <p className="text-xs text-gray-500">
                        Pricing Helper
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChat}
                      className="p-1.5 h-auto hover:bg-white/10 flex items-center justify-center"
                      title="Clear chat"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-gray-400 hover:text-gray-300" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(true)}
                      className="p-1.5 h-auto hover:bg-white/10 flex items-center justify-center"
                      title="Minimize"
                    >
                      <Minimize2 className="h-3.5 w-3.5 text-gray-400 hover:text-gray-300" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 h-auto hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center"
                      title="Close chat"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' 
                            ? 'bg-blue-500' 
                            : 'bg-gradient-to-r from-purple-500 to-blue-600'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4 text-white" />
                          ) : (
                            <Bot className="h-4 w-4 text-white" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div className={`rounded-2xl px-4 py-3 overflow-hidden ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 border border-white/20 text-gray-900 dark:text-white'
                        }`}>
                          <div className="text-sm leading-relaxed max-w-full whitespace-pre-line">
                            {message.content}
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Loading indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-sm text-gray-400">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about LLM pricing..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed !flex !items-center !justify-center !gap-0"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Chat Window */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-6 z-40 w-[300px]"
          >
            <GlassCard className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      LLM Assistant
                    </h3>
                    <p className="text-xs text-gray-500">
                      {messages.length > 1 ? `${messages.length - 1} messages` : 'Ready to help'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(false)}
                    className="p-1.5 h-auto hover:bg-white/10 flex items-center justify-center"
                    title="Expand chat"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-300" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 h-auto hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center"
                    title="Close chat"
                  >
                    <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}