import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { History } from 'lucide-react-native';
import React from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ConversationItem from '@/components/conversation-item';
import EmptyState from '@/components/empty-state';
import Colors from '@/lib/constants/colors';
import { useConversationStore } from '@/lib/store/conversation-store';

export default function HistoryScreen() {
  const { conversations, setCurrentConversation, deleteConversation } =
    useConversationStore();
  const router = useRouter();

  const handleConversationPress = (conversationId: string) => {
    setCurrentConversation(conversationId);
    router.push('/');
  };

  const handleDeleteConversation = (conversationId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteConversation(conversationId),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar style="dark" />

      {conversations.length === 0 ? (
        <EmptyState
          icon={<History size={48} color={Colors.primary} />}
          title="No Conversations Yet"
          message="Your conversation history will appear here once you start chatting with the AI."
        />
      ) : (
        <FlatList
          data={conversations}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={() => handleConversationPress(item.id)}
              onDelete={() => handleDeleteConversation(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
});
