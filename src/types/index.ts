export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  date: number;
  topics: string[];
  summary?: string;
}

export interface ConversationStats {
  topTopics: { topic: string; count: number }[];
  conversationCount: number;
  messageCount: { user: number; ai: number };
  averageMessagesPerConversation: number;
  weeklyActivity: { date: string; count: number }[];
}
