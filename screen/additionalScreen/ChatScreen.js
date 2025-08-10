import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useUser } from '../../context/UserContext';
import chatApiService from '../../services/chatApiService';
import socketService from '../../services/socketService';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatScreen({ navigation, route }) {
  const { userData } = useUser();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if we need to refresh (coming from CreateChatScreen)
  const shouldRefresh = route.params?.refresh;

  // Refresh chats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userData?.uid) {
        console.log('ChatScreen: Screen focused, refreshing chats');
        loadChats();
      }
    }, [userData])
  );

  useEffect(() => {
    if (userData?.uid) {
      console.log('ChatScreen: userData.uid found:', userData.uid);
      loadChats();
      socketService.connect(userData.uid);
    } else {
      console.log('ChatScreen: userData.uid not found:', userData);
      setLoading(false);
    }
  }, [userData]);

  // Handle refresh parameter from navigation
  useEffect(() => {
    if (shouldRefresh) {
      console.log('ChatScreen: Refreshing chats due to navigation parameter');
      loadChats();
      // Clear the refresh parameter
      navigation.setParams({ refresh: undefined });
    }
  }, [shouldRefresh]);

  useEffect(() => {
    // Listen for new messages
    socketService.onReceiveMessage((newMessage) => {
      updateChatWithNewMessage(newMessage);
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const loadChats = async () => {
    try {
      console.log('ChatScreen: Starting to load chats for user:', userData?.uid);
      setLoading(true);
      
      if (!userData?.uid) {
        console.log('ChatScreen: No userData.uid available');
        setLoading(false);
        return;
      }

      const response = await chatApiService.getUserChats(userData.uid);
      console.log('ChatScreen: API response:', response);
      
      setChats(response.chats || []);
      setLoading(false);
    } catch (error) {
      console.error('ChatScreen: Error loading chats:', error);
      Alert.alert('Error', 'Failed to load chats: ' + error.message);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const updateChatWithNewMessage = (newMessage) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat._id === newMessage.chat) {
          return {
            ...chat,
            lastMessage: newMessage,
            messages: [...(chat.messages || []), newMessage._id]
          };
        }
        return chat;
      });
      
      // Move the updated chat to the top
      const updatedChat = updatedChats.find(chat => chat._id === newMessage.chat);
      if (updatedChat) {
        const filteredChats = updatedChats.filter(chat => chat._id !== newMessage.chat);
        return [updatedChat, ...filteredChats];
      }
      
      return updatedChats;
    });
  };

  const getOtherUser = (chat) => {
    if (!chat.members || !userData) return null;
    return chat.members.find(member => member.uid !== userData.uid);
  };

  const getChatParticipants = (chat) => {
    if (!chat.members || !userData) return [];
    
    // Filter out current user and return other participants
    return chat.members.filter(member => member.uid !== userData.uid);
  };

  const getChatTitle = (chat) => {
    if (chat.chatName) {
      return chat.chatName; // Group chat with custom name
    }
    
    const participants = getChatParticipants(chat);
    
    if (participants.length === 0) {
      return 'Unknown Chat';
    } else if (participants.length === 1) {
      return participants[0].displayName || 'Unknown User'; // 1-on-1 chat
    } else if (participants.length === 2) {
      const name1 = participants[0].displayName || 'Unknown User';
      const name2 = participants[1].displayName || 'Unknown User';
      return `${name1}, ${name2}`; // 2 participants
    } else {
      const firstName = participants[0].displayName || 'Unknown User';
      return `${firstName} +${participants.length - 1} others`; // Multiple participants
    }
  };

  const getLastMessageText = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    return chat.lastMessage.content.length > 30 
      ? chat.lastMessage.content.substring(0, 30) + '...'
      : chat.lastMessage.content;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderChatItem = ({ item }) => {
    const participants = getChatParticipants(item);
    if (participants.length === 0) return null;

    const isGroupChat = participants.length > 1 || item.chatName;
    const chatTitle = getChatTitle(item);
    const firstParticipant = participants[0];

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('MessagesChat', { 
          chatId: item.chatId,
          otherUser: firstParticipant,
          chat: item
        })}
      >
        <View style={styles.avatarContainer}>
          {isGroupChat ? (
            // Group chat - show multiple avatars or group icon
            <View style={styles.groupAvatarContainer}>
              {participants.length === 2 ? (
                // Show two avatars side by side
                <View style={styles.dualAvatarContainer}>
                  <Image
                    source={
                      participants[0].profilePicture
                        ? { uri: participants[0].profilePicture }
                        : require('../../assets/avatar_paw_pal.png')
                    }
                    style={styles.groupAvatar1}
                  />
                  <Image
                    source={
                      participants[1].profilePicture
                        ? { uri: participants[1].profilePicture }
                        : require('../../assets/avatar_paw_pal.png')
                    }
                    style={styles.groupAvatar2}
                  />
                </View>
              ) : (
                // Show group icon for larger groups
                <View style={styles.groupIconContainer}>
                  <Text style={styles.groupIconText}>
                    {participants.length > 2 ? participants.length : 'G'}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            // 1-on-1 chat - show single avatar
            <>
              <Image
                source={
                  firstParticipant.profilePicture
                    ? { uri: firstParticipant.profilePicture }
                    : require('../../assets/avatar_paw_pal.png')
                }
                style={styles.avatar}
              />
              {firstParticipant.isOnline && <View style={styles.onlineIndicator} />}
            </>
          )}
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {chatTitle}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(item.lastMessage?.timestamp)}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {getLastMessageText(item)}
          </Text>
          {isGroupChat && participants.length > 2 && (
            <Text style={styles.participantCount}>
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/chat_icon.png')}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            Start a conversation with other pet lovers!
          </Text>
          <TouchableOpacity
            style={styles.createChatButton}
            onPress={() => navigation.navigate('CreateChat')}
          >
            <Text style={styles.createChatButtonText}>Create New Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#FF6347']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CreateChat')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  groupAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  dualAvatarContainer: {
    flexDirection: 'row',
    width: 50,
    height: 50,
  },
  groupAvatar1: {
    width: 25,
    height: 50,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  groupAvatar2: {
    width: 25,
    height: 50,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  groupIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupIconText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  participantCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    opacity: 0.5,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createChatButton: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createChatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});