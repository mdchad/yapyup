import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/lib/constants/colors';

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
      style={[
        styles.container,
        isHighlighted ? styles.highlightedContainer : null,
      ]}
    >
      <Text
        style={[styles.topic, isHighlighted ? styles.highlightedTopic : null]}
      >
        {topic}
      </Text>
      <View
        style={[
          styles.countContainer,
          isHighlighted ? styles.highlightedCountContainer : null,
        ]}
      >
        <Text
          style={[styles.count, isHighlighted ? styles.highlightedCount : null]}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  highlightedContainer: {
    backgroundColor: Colors.primary + '20', // 20% opacity
  },
  topic: {
    fontSize: 14,
    color: Colors.text,
    marginRight: 8,
  },
  highlightedTopic: {
    color: Colors.primary,
    fontWeight: '500',
  },
  countContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  highlightedCountContainer: {
    backgroundColor: Colors.primary,
  },
  count: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  highlightedCount: {
    color: Colors.white,
  },
});
