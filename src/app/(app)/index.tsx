import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
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
    setIsRecording,
    setIsProcessing,
  } = useConversationStore();

  const [transcription, setTranscription] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const processingRef = useRef(false);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  const messages = currentConversation?.messages || [];

  // Handle speech recognition results
  useSpeechRecognitionEvent('result', (event) => {
    console.log('Speech result:', event); // Debug log
    const lastResult = event.results[event.results.length - 1];
    if (event?.isFinal && lastResult?.transcript) {
      console.log('Got transcript:', lastResult.transcript); // Debug log
      setCurrentTranscription(lastResult.transcript);
      // Update live messages with the current transcription
      setLiveMessages([
        ...liveMessages,
        {
          id: `live-transcription-${Math.random()}`,
          text: lastResult.transcript,
          sender: 'user',
          timestamp: Date.now(),
        },
      ]);
    }
  });

  // Handle pause detection
  useSpeechRecognitionEvent('end', () => {
    console.log(
      'Speech end detected, current transcription:',
      currentTranscription
    ); // Debug log
    if (currentTranscription && !processingRef.current) {
      setTranscription(currentTranscription);
      setCurrentTranscription('');
      setLiveMessages([]); // Clear live messages when speech ends
    }
  });

  // Handle speech start
  useSpeechRecognitionEvent('start', () => {
    console.log('Speech recognition started'); // Debug log
  });

  // Handle speech recognition errors
  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error, event.message);
    setIsRecording(false);
    Alert.alert('Error', `Speech recognition error: ${event.message}`);
  });

  useEffect(() => {
    // Request microphone permission on component mount
    const getPermission = async () => {
      try {
        const result =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        setHasPermission(result.granted);
        if (!result.granted) {
          Alert.alert(
            'Permission Required',
            'Microphone permission is required for speech recognition.'
          );
        }
      } catch (error) {
        console.error('Error requesting microphone permission:', error);
        Alert.alert(
          'Permission Error',
          'Failed to request microphone permission. Speech recognition may not work.'
        );
      }
    };

    getPermission();
  }, []);

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
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to use speech recognition.'
        );
        return;
      }

      setIsRecording(true);
      setCurrentTranscription('');
      setLiveMessages([]); // Clear any previous live messages
      processingRef.current = false;

      // Start listening with continuous recognition
      await ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: Platform.OS === 'ios',
      });
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
      processingRef.current = false;
      setLiveMessages([]); // Clear live messages
      // Process any remaining transcription
      if (currentTranscription) {
        setTranscription(currentTranscription);
        setCurrentTranscription('');
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      setIsRecording(false);
    }
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
    if (transcription && currentConversationId) {
      const processTranscription = async () => {
        processingRef.current = true;
        setIsProcessing(true);

        // Add user message
        // addMessage(currentConversationId, {
        //   text: transcription,
        //   sender: 'user',
        //   timestamp: Date.now(),
        // });

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

        setIsProcessing(false);
        processingRef.current = false;
      };

      processTranscription();
    }
  }, [
    transcription,
    currentConversationId,
    setIsProcessing,
    addMessage,
    messages,
    updateConversationTopics,
    updateConversationTitle,
  ]);

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
        {messages.length === 0 && liveMessages.length === 0 ? (
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
            data={[...liveMessages]}
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
  liveTranscriptionContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 16,
  },
});
