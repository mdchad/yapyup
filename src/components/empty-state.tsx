import React from 'react';
import { Text, View } from 'react-native';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
}

export default function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-6">{icon}</View>
      <Text className="mb-2 text-center text-xl font-semibold text-charcoal-800">
        {title}
      </Text>
      <Text className="text-center text-base leading-[22px] text-zinc-400">
        {message}
      </Text>
    </View>
  );
}
