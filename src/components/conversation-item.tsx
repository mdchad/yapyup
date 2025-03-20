import { MessageSquare, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Colors from '@/lib/constants/colors';
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
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <MessageSquare size={24} color={Colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {conversation.title}
        </Text>
        <Text style={styles.details}>
          {formattedDate} • {messageCount} message
          {messageCount !== 1 ? 's' : ''}
        </Text>
        {conversation.topics.length > 0 && (
          <View style={styles.topicsContainer}>
            {conversation.topics.slice(0, 3).map((topic, index) => (
              <View key={index} style={styles.topicBadge}>
                <Text style={styles.topicText}>{topic}</Text>
              </View>
            ))}
            {conversation.topics.length > 3 && (
              <Text style={styles.moreTopics}>
                +{conversation.topics.length - 3}
              </Text>
            )}
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Trash2 size={20} color={Colors.darkGray} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: Colors.darkGray,
    marginBottom: 8,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicBadge: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 12,
    color: Colors.text,
  },
  moreTopics: {
    fontSize: 12,
    color: Colors.darkGray,
    alignSelf: 'center',
  },
  deleteButton: {
    padding: 8,
  },
});
