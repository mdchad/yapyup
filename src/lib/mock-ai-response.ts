// This is a simple mock for AI responses
// In a real app, you would connect to an actual AI service

export const generateAiResponse = (userMessage: string): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Simple responses based on user input
      if (
        userMessage.toLowerCase().includes('hello') ||
        userMessage.toLowerCase().includes('hi')
      ) {
        resolve('Hello! How can I assist you today?');
      } else if (
        userMessage.toLowerCase().includes('meeting') ||
        userMessage.toLowerCase().includes('transcribe')
      ) {
        resolve(
          "I'm ready to help transcribe your meeting. Just start speaking about the key points, and I'll organize them for you."
        );
      } else if (
        userMessage.toLowerCase().includes('journal') ||
        userMessage.toLowerCase().includes('diary')
      ) {
        resolve(
          "Let's journal together. How was your day? What were the highlights and challenges you faced?"
        );
      } else if (
        userMessage.toLowerCase().includes('note') ||
        userMessage.toLowerCase().includes('notes')
      ) {
        resolve("I'm ready to take notes. What would you like to remember?");
      } else if (
        userMessage.toLowerCase().includes('brainstorm') ||
        userMessage.toLowerCase().includes('idea')
      ) {
        resolve(
          "Let's brainstorm together. What's the topic or problem you're working on?"
        );
      } else if (
        userMessage.toLowerCase().includes('learn') ||
        userMessage.toLowerCase().includes('study')
      ) {
        resolve(
          "I'd be happy to help you learn. What topic are you interested in exploring?"
        );
      } else if (userMessage.toLowerCase().includes('thank')) {
        resolve("You're welcome! Is there anything else I can help you with?");
      } else if (
        userMessage.toLowerCase().includes('bye') ||
        userMessage.toLowerCase().includes('goodbye')
      ) {
        resolve(
          'Goodbye! Feel free to chat again whenever you need assistance.'
        );
      } else {
        resolve(
          "I understand. Please tell me more about what you're looking for, and I'll do my best to help."
        );
      }
    }, 1000);
  });
};

export const extractTopics = (conversation: string[]): string[] => {
  // This is a simplified topic extraction
  // In a real app, you would use NLP or AI to extract topics

  const commonTopics = [
    'meeting',
    'work',
    'project',
    'idea',
    'journal',
    'note',
    'reminder',
    'learning',
    'study',
    'brainstorm',
    'personal',
    'health',
    'finance',
    'travel',
    'technology',
  ];

  const extractedTopics = new Set<string>();

  conversation.forEach((message) => {
    commonTopics.forEach((topic) => {
      if (
        message.toLowerCase().includes(topic) &&
        !extractedTopics.has(topic)
      ) {
        extractedTopics.add(topic.charAt(0).toUpperCase() + topic.slice(1));
      }
    });
  });

  return Array.from(extractedTopics).slice(0, 5);
};

export const generateTitle = (firstMessage: string): string => {
  // Simple title generation based on first message
  // In a real app, you would use AI to generate a more meaningful title

  const words = firstMessage.split(' ');
  const titleWords = words.slice(0, 4);
  let title = titleWords.join(' ');

  if (words.length > 4) {
    title += '...';
  }

  return title;
};
