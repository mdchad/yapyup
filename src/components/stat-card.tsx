import React from 'react';
import { Text, View } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <View className="min-h-[120px] flex-1 items-center justify-center rounded-xl bg-white p-4 shadow-sm">
      <View className="mb-3">{icon}</View>
      <Text className="mb-1 text-2xl font-bold text-zinc-400">{value}</Text>
      <Text className="text-center text-sm text-zinc-400">{title}</Text>
    </View>
  );
}
