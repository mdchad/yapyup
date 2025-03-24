import React from 'react';
import { Text, View } from 'react-native';

interface ActivityChartProps {
  data: { date: string; count: number }[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const maxCount = Math.max(...data.map((item) => item.count), 1);

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'short' });
  };

  return (
    <View className="mb-4 rounded-xl bg-white p-4 shadow-sm">
      <Text className="mb-4 text-base font-semibold text-charcoal-800">
        Weekly Activity
      </Text>
      <View className="h-[150px] flex-row items-end justify-between">
        {data.map((item, index) => {
          const barHeight = (item.count / maxCount) * 100;
          return (
            <View key={index} className="flex-1 items-center">
              <View className="mb-1">
                <Text className="text-xs text-zinc-400">{item.count}</Text>
              </View>
              <View className="h-[100px] w-full items-center justify-end">
                <View
                  className={`w-[8px] rounded-[4px] ${
                    item.count > 0 ? 'bg-primary-400' : 'bg-neutral-200'
                  }`}
                  style={{ height: `${Math.max(barHeight, 5)}%` }}
                />
              </View>
              <Text className="mt-2 text-xs text-zinc-400">
                {getDayName(item.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
