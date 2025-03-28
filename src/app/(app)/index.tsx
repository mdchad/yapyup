//@ts-nocheck
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  type FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MessageBubble from '@/components/message-bubble';
import RecordButton from '@/components/record-button';
import { generateAPIUrl } from '@/lib';
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

  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    onError: (error) => console.error(error, 'ERROR'),
  });

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  // const messages = currentConversation?.messages || [];

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

        // handleSubmit(transcription)
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
    <SafeAreaView className="bg-background flex-1" edges={['right', 'left']}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/*{messages.length === 0 && liveMessages.length === 0 ? (*/}
        {/*  <View className="flex-1 justify-center">*/}
        {/*    <EmptyState*/}
        {/*      icon={<MessageSquare size={48} color={colors.primary[400]} />}*/}
        {/*      title="Start a Conversation"*/}
        {/*      message="Tap the microphone button and start speaking, or select one of the suggested prompts below."*/}
        {/*    />*/}

        {/*    <View className="absolute inset-x-0 bottom-[100px] px-4">*/}
        {/*      <Text className="mb-3 text-base font-semibold text-charcoal-800">*/}
        {/*        Suggested Prompts*/}
        {/*      </Text>*/}
        {/*      <ScrollView*/}
        {/*        horizontal*/}
        {/*        showsHorizontalScrollIndicator={false}*/}
        {/*        className="flex-row flex-wrap pr-4"*/}
        {/*      >*/}
        {/*        {suggestedPrompts.map((prompt) => (*/}
        {/*          <PromptSuggestion*/}
        {/*            key={prompt.id}*/}
        {/*            title={prompt.title}*/}
        {/*            onPress={() => handlePromptSelect(prompt.prompt)}*/}
        {/*          />*/}
        {/*        ))}*/}
        {/*      </ScrollView>*/}
        {/*    </View>*/}
        {/*  </View>*/}
        {/*) : (*/}
        {/*  <FlatList*/}
        {/*    ref={flatListRef}*/}
        {/*    data={[...liveMessages]}*/}
        {/*    renderItem={renderMessage}*/}
        {/*    keyExtractor={(item) => item.id}*/}
        {/*    className="p-4 pb-20"*/}
        {/*    showsVerticalScrollIndicator={false}*/}
        {/*  />*/}
        {/*)}*/}

        {/*{isProcessing && (*/}
        {/*  <View className="mb-2 flex-row items-center justify-center self-center rounded-full bg-gray-100 p-2">*/}
        {/*    <ActivityIndicator color={colors.primary[400]} size="small" />*/}
        {/*    <Text className="ml-2 text-sm text-charcoal-800">*/}
        {/*      Processing...*/}
        {/*    </Text>*/}
        {/*  </View>*/}
        {/*)}*/}

        <View
          style={{
            height: '95%',
            display: 'flex',
            flexDirection: 'column',
            paddingHorizontal: 8,
          }}
        >
          <ScrollView style={{ flex: 1 }}>
            {messages.map((m) => (
              <View key={m.id} style={{ marginVertical: 8 }}>
                <View>
                  <Text style={{ fontWeight: 700 }}>{m.role}</Text>
                  <Text>{m.content}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ marginTop: 8 }}>
          <TextInput
            style={{ backgroundColor: 'white', padding: 8 }}
            placeholder="Say something..."
            value={input}
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: {
                  ...e.target,
                  value: e.nativeEvent.text,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            onSubmitEditing={(e) => {
              handleSubmit(e);
              e.preventDefault();
            }}
            autoFocus={true}
          />
        </View>

        <View className="absolute inset-x-0 bottom-4 items-center justify-center">
          <RecordButton
            isRecording={isRecording}
            onPress={handleToggleRecording}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
