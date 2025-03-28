import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface PromptSuggestionProps {
  title: string;
  onPress: () => void;
}

export default function PromptSuggestion({
  title,
  onPress,
}: PromptSuggestionProps) {
  return (
    <TouchableOpacity
      className="mb-2.5 mr-2.5 rounded-[20px] bg-gray-100 px-4 py-3"
      onPress={onPress}
    >
      <Text className="text-sm font-medium text-charcoal-800">{title}</Text>
    </TouchableOpacity>
  );
}
