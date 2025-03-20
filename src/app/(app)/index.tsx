import { StatusBar } from 'expo-status-bar';
import { MessageSquare } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '@/components/empty-state';
import MessageBubble from '@/components/message-bubble';
import PromptSuggestion from '@/components/prompt-suggestion';
import RecordButton from '@/components/record-button';
import Colors from '@/lib/constants/colors';
import { suggestedPrompts } from '@/lib/constants/prompts';
import {
  extractTopics,
  generateAiResponse,
  generateTitle,
} from '@/lib/mock-ai-response';
import { useConversationStore } from '@/lib/store/conversation-store';
import { type Message } from '@/types';

// eslint-disable-next-line max-lines-per-function
export default function Chat() {
  const {
    conversations,
    currentConversationId,
    isRecording,
    isProcessing,
    startNewConversation,
    addMessage,
    updateConversationTitle,
    updateConversationTopics,
    // setCurrentConversation,
    setIsRecording,
    setIsProcessing,
  } = useConversationStore();

  const [transcription, setTranscription] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  const messages = currentConversation?.messages || [];

  useEffect(() => {
    // If there's no current conversation, start a new one
    if (!currentConversationId) {
      startNewConversation();
    }
  }, [currentConversationId, startNewConversation]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleStartRecording = async () => {
    try {
      // In a real app, you would use Speech Recognition API
      // For this mock, we'll simulate recording
      setIsRecording(true);

      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        setTranscription(
          'This is a simulated transcription. In a real app, this would be your actual speech converted to text.'
        );
      }, 3000);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  useEffect(() => {
    // Process transcription when available
    if (transcription && !isRecording && currentConversationId) {
      const processTranscription = async () => {
        setIsProcessing(true);

        // Add user message
        addMessage(currentConversationId, {
          text: transcription,
          sender: 'user',
          timestamp: Date.now(),
        });

        // If this is the first message, update the conversation title
        if (messages.length === 0) {
          updateConversationTitle(
            currentConversationId,
            generateTitle(transcription)
          );
        }

        // Get AI response
        const aiResponse = await generateAiResponse(transcription);

        // Add AI message
        addMessage(currentConversationId, {
          text: aiResponse,
          sender: 'ai',
          timestamp: Date.now(),
        });

        // Extract topics from the conversation
        const allMessages = [
          ...messages.map((m) => m.text),
          transcription,
          aiResponse,
        ];
        const topics = extractTopics(allMessages);
        updateConversationTopics(currentConversationId, topics);

        setTranscription('');
        setIsProcessing(false);
      };

      processTranscription();
    }
  }, [transcription, isRecording, currentConversationId]);

  const handlePromptSelect = (prompt: string) => {
    setTranscription(prompt);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon={<MessageSquare size={48} color={Colors.primary} />}
              title="Start a Conversation"
              message="Tap the microphone button and start speaking, or select one of the suggested prompts below."
            />

            <View style={styles.promptsContainer}>
              <Text style={styles.promptsTitle}>Suggested Prompts</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promptsScrollContent}
              >
                {suggestedPrompts.map((prompt) => (
                  <PromptSuggestion
                    key={prompt.id}
                    title={prompt.title}
                    onPress={() => handlePromptSelect(prompt.prompt)}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator color={Colors.primary} size="small" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <RecordButton
            isRecording={isRecording}
            onPress={handleToggleRecording}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    padding: 16,
  },
  promptsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  promptsScrollContent: {
    paddingRight: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 8,
  },
  processingText: {
    marginLeft: 8,
    color: Colors.text,
    fontSize: 14,
  },
});
