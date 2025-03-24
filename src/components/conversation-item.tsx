import { MessageSquare, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import colors from '@/components/ui/colors';
import { type Conversation } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
  onDelete: () => void;
}

export default function ConversationItem({
  conversation,
  onPress,
  onDelete,
}: ConversationItemProps) {
  const messageCount = conversation.messages.length;
  const formattedDate = new Date(conversation.date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      className="mb-3 flex-row rounded-xl bg-white p-4 shadow-sm"
      onPress={onPress}
    >
      <View className="mr-3 size-10 items-center justify-center rounded-full bg-gray-100">
        <MessageSquare size={24} color={colors.primary[400]} />
      </View>
      <View className="flex-1">
        <Text
          className="text-text mb-1 text-base font-semibold"
          numberOfLines={1}
        >
          {conversation.title}
        </Text>
        <Text className="mb-2 text-sm text-zinc-400">
          {formattedDate} • {messageCount} message
          {messageCount !== 1 ? 's' : ''}
        </Text>
        {conversation.topics.length > 0 && (
          <View className="flex-row flex-wrap">
            {conversation.topics.slice(0, 3).map((topic, index) => (
              <View
                key={index}
                className="mb-1 mr-1.5 rounded-xl bg-gray-100 px-2 py-1"
              >
                <Text className="text-xs text-charcoal-800">{topic}</Text>
              </View>
            ))}
            {conversation.topics.length > 3 && (
              <Text className="self-center text-xs text-zinc-400">
                +{conversation.topics.length - 3}
              </Text>
            )}
          </View>
        )}
      </View>
      <TouchableOpacity className="p-2" onPress={onDelete}>
        <Trash2 size={20} color={colors.neutral[800]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
