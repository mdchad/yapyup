import React from 'react';
import { Text, View } from 'react-native';

interface TopicBadgeProps {
  topic: string;
  count: number;
  index: number;
}

export default function TopicBadge({ topic, count, index }: TopicBadgeProps) {
  // Alternate between different shades
  const isHighlighted = index === 0;

  return (
    <View
      className={`mb-2 mr-2 flex-row items-center rounded-[20px] py-1.5 pl-3 pr-1 ${
        isHighlighted ? 'bg-primary-100' : 'bg-gray-100'
      }`}
    >
      <Text
        className={`mr-2 text-sm ${
          isHighlighted ? 'font-medium text-primary-400' : 'text-charcoal-800'
        }`}
      >
        {topic}
      </Text>
      <View
        className={`rounded-xl px-2 py-0.5 ${
          isHighlighted ? 'bg-primary-400' : 'bg-white'
        }`}
      >
        <Text
          className={`text-xs font-medium ${isHighlighted ? 'text-white' : 'text-charcoal-800'}`}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}
