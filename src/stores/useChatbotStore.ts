import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
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
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatbotStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createSession: () => string;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSession: (sessionId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useChatbotStore = create<ChatbotStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      error: null,

      createSession: () => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          messages: [],
          title: 'New Conversation',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set(state => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));

        return newSession.id;
      },

      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      addMessage: (sessionId, messageData) => {
        const message: ChatMessage = {
          ...messageData,
          id: Date.now().toString(),
          timestamp: new Date(),
        };

        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [...session.messages, message],
                  updatedAt: new Date(),
                }
              : session
          ),
        }));
      },

      updateSessionTitle: (sessionId, title) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  title: title.slice(0, 50) + (title.length > 50 ? '...' : ''),
                  updatedAt: new Date(),
                }
              : session
          ),
        }));
      },

      deleteSession: (sessionId) => {
        set(state => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        }));
      },

      clearSession: (sessionId) => {
        set(state => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: [],
                  updatedAt: new Date(),
                }
              : session
          ),
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'chatbot-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);