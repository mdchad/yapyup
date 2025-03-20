import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';

import {
  type Conversation,
  type ConversationStats,
  type Message,
} from '@/types';

// Initialize MMKV storage for conversations
const storage = new MMKV({ id: 'conversation-storage' });

const mmkvStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

// Helper function to calculate conversation stats
function calculateConversationStats(
  conversations: Conversation[]
): ConversationStats {
  // Count all topics
  const topicCounts: Record<string, number> = {};
  conversations.forEach((conv) => {
    conv.topics.forEach((topic) => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  // Sort topics by count
  const topTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Count messages by sender
  let userMessageCount = 0;
  let aiMessageCount = 0;
  conversations.forEach((conv) => {
    conv.messages.forEach((msg) => {
      if (msg.sender === 'user') userMessageCount++;
      else aiMessageCount++;
    });
  });

  // Calculate weekly activity
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(oneWeekAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0];

    const count = conversations.filter((conv) => {
      const convDate = new Date(conv.date);
      return convDate.toISOString().split('T')[0] === dateString;
    }).length;

    return { date: dateString, count };
  });

  return {
    topTopics,
    conversationCount: conversations.length,
    messageCount: { user: userMessageCount, ai: aiMessageCount },
    averageMessagesPerConversation: conversations.length
      ? (userMessageCount + aiMessageCount) / conversations.length
      : 0,
    weeklyActivity,
  };
}

interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isRecording: boolean;
  isProcessing: boolean;

  // Actions
  startNewConversation: () => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id'>) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  updateConversationTopics: (conversationId: string, topics: string[]) => void;
  deleteConversation: (conversationId: string) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  getConversationStats: () => ConversationStats;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isRecording: false,
      isProcessing: false,

      startNewConversation: () => {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          title: 'New Conversation',
          messages: [],
          date: Date.now(),
          topics: [],
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: newConversation.id,
        }));

        return newConversation.id;
      },

      addMessage: (conversationId, messageData) => {
        const message: Message = {
          id: Date.now().toString(),
          ...messageData,
        };

        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, messages: [...conv.messages, message] }
              : conv
          ),
        }));
      },

      updateConversationTitle: (conversationId, title) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, title } : conv
          ),
        }));
      },

      updateConversationTopics: (conversationId, topics) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, topics } : conv
          ),
        }));
      },

      deleteConversation: (conversationId) => {
        set((state) => ({
          conversations: state.conversations.filter(
            (conv) => conv.id !== conversationId
          ),
          currentConversationId:
            state.currentConversationId === conversationId
              ? null
              : state.currentConversationId,
        }));
      },

      setCurrentConversation: (conversationId) => {
        set({ currentConversationId: conversationId });
      },

      setIsRecording: (isRecording) => {
        set({ isRecording });
      },

      setIsProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      getConversationStats: () => {
        return calculateConversationStats(get().conversations);
      },
    }),
    {
      name: 'conversation-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
