import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import Colors from '@/lib/constants/colors';

interface PromptSuggestionProps {
  title: string;
  onPress: () => void;
}

export default function PromptSuggestion({
  title,
  onPress,
}: PromptSuggestionProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  text: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
