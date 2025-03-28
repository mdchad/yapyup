import React from 'react';
import { Text, View } from 'react-native';

import { type Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <View
      className={`my-2 max-w-[80%] ${
        isUser ? 'items-end self-end' : 'items-start self-start'
      }`}
    >
      <View
        className={`rounded-[18px] px-4 py-2.5 ${
          isUser ? 'bg-primary-400' : 'bg-gray-100'
        }`}
      >
        <Text
          className={`text-base leading-[22px] ${
            isUser ? 'text-white' : 'text-charcoal-800'
          }`}
        >
          {message.text}
        </Text>
      </View>
      <Text className="mt-1 text-xs text-zinc-400">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}
