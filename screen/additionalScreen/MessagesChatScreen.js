import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useUser } from '../../context/UserContext';
import chatApiService from '../../services/chatApiService';
import socketService from '../../services/socketService';

export default function MessagesChatScreen({ route, navigation }) {
  const { chatId, otherUser, chat } = route.params;
  const { userData } = useUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);

  // Check if we need to refresh (coming from AddParticipantsScreen)
  const shouldRefresh = route.params?.refresh;

  // Debug: log messages state changes
  useEffect(() => {
    console.log('MessagesChatScreen: Messages state updated:', messages.length, 'messages');
    console.log('MessagesChatScreen: Current messages:', messages);
  }, [messages]);

  useEffect(() => {
    loadMessages();
    joinChat();
    setupSocketListeners();

    return () => {
      leaveChat();
      socketService.removeAllListeners();
      // Clear any existing typing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, []);

  // Handle refresh parameter from navigation
  useEffect(() => {
    if (shouldRefresh) {
      console.log('MessagesChatScreen: Refreshing due to navigation parameter');
      loadMessages();
      // Clear the refresh parameter
      navigation.setParams({ refresh: undefined });
    }
  }, [shouldRefresh]);

  // Clear typing indicator after 3 seconds
  useEffect(() => {
    if (isTyping) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setTypingUser('');
      }, 3000);
      setTypingTimeout(timeout);
    }
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [isTyping]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('MessagesChatScreen: Loading messages for chatId:', chatId);
      const response = await chatApiService.getChatMessages(chatId);
      console.log('MessagesChatScreen: Loaded messages response:', response);
      setMessages(response.messages || []);
      console.log('MessagesChatScreen: Set messages to state:', response.messages?.length || 0, 'messages');
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const joinChat = () => {
    socketService.joinChat(chatId);
  };

  const leaveChat = () => {
    socketService.leaveChat(chatId);
  };

  const setupSocketListeners = () => {
    // Listen for new messages
    socketService.onReceiveMessage((newMessage) => {
      console.log('MessagesChatScreen: Received message via Socket.IO:', newMessage);
      console.log('MessagesChatScreen: Current chatId:', chatId);
      console.log('MessagesChatScreen: Message chat field:', newMessage.chat);
      
      // Check if the message belongs to this chat
      // The server sends the MongoDB _id as chat field, but we have the chatId (UUID)
      // We need to check if this message belongs to our current chat
      if (newMessage.chat && newMessage.sender) {
        // Check for duplicates by messageId
        setMessages(prevMessages => {
          const isDuplicate = prevMessages.some(msg => msg.messageId === newMessage.messageId);
          if (isDuplicate) {
            console.log('MessagesChatScreen: Duplicate message detected, ignoring:', newMessage.messageId);
            return prevMessages;
          }
          console.log('MessagesChatScreen: Added message to state');
          return [...prevMessages, newMessage];
        });
      } else {
        console.log('MessagesChatScreen: Message rejected - missing chat or sender info');
      }
    });

    // Listen for typing indicators
    socketService.onUserTyping((data) => {
      console.log('MessagesChatScreen: User typing event received:', data);
      if (data.userId !== userData.uid) { // Changed from userData._id
        console.log('MessagesChatScreen: Setting typing indicator for:', data.userName);
        setIsTyping(true);
        setTypingUser(data.userName);
      }
    });

    socketService.onUserStopTyping((data) => {
      console.log('MessagesChatScreen: User stop typing event received:', data);
      if (data.userId !== userData.uid) { // Changed from userData._id
        console.log('MessagesChatScreen: Clearing typing indicator for:', data.userId);
        setIsTyping(false);
        setTypingUser('');
      }
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    console.log('MessagesChatScreen: Sending message:', messageText);
    console.log('MessagesChatScreen: chatId:', chatId);
    console.log('MessagesChatScreen: userData.uid:', userData.uid);
    
    setNewMessage('');

    // Stop typing when sending a message
    socketService.stopTyping(chatId, userData.uid);
    setIsTyping(false);
    setTypingUser('');

    // Send via Socket.IO for real-time (primary method)
    console.log('MessagesChatScreen: Sending via Socket.IO...');
    socketService.sendMessage(
      chatId,
      userData.uid,
      messageText,
      ''
    );

    // HTTP is handled by the server when Socket.IO message is received
    // No need to send via HTTP separately to avoid duplicates
  };

  const onInputTextChanged = (text) => {
    setNewMessage(text);
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    if (text.length > 0) {
      // Start typing
      socketService.startTyping(chatId, userData.uid, userData.displayName);
      
      // Set a timeout to stop typing after 2 seconds of no input
      const timeout = setTimeout(() => {
        socketService.stopTyping(chatId, userData.uid);
      }, 2000);
      setTypingTimeout(timeout);
    } else {
      // Stop typing immediately when text is empty
      socketService.stopTyping(chatId, userData.uid);
    }
  };

  const getChatParticipants = () => {
    if (!chat?.members || !userData) return [];
    
    // Filter out current user and return other participants
    return chat.members.filter(member => member.uid !== userData.uid);
  };

  const getChatTitle = () => {
    if (chat?.chatName) {
      return chat.chatName; // Group chat with custom name
    }
    
    const participants = getChatParticipants();
    
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

  const handleLeaveChat = () => {
    Alert.alert(
      'Leave Chat',
      'Are you sure you want to leave this chat? You will no longer receive messages from this conversation.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('MessagesChatScreen: Leaving chat:', chatId);
              const response = await chatApiService.leaveChat(chatId, userData.uid);
              console.log('MessagesChatScreen: Leave chat response:', response);
              
              if (response.chatDeleted) {
                Alert.alert(
                  'Chat Deleted',
                  'The chat has been deleted as no members remain.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        navigation.pop();
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Left Chat',
                  'You have successfully left the chat.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        navigation.pop();
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              console.error('Error leaving chat:', error);
              Alert.alert('Error', 'Failed to leave chat. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender.uid === userData.uid;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {/* Show sender name for messages from other users */}
        {!isOwnMessage && item.sender.displayName && (
          <Text style={styles.senderName}>
            {item.sender.displayName}
          </Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerLeft}
            onPress={() => {
              const participants = getChatParticipants();
              if (participants.length > 1) {
                setShowParticipants(!showParticipants);
              }
            }}
          >
            <Text style={styles.headerTitle}>
              {getChatTitle()}
            </Text>
            {chat?.members && chat.members.length > 2 && (
              <Text style={styles.participantCount}>
                {chat.members.length} participants
              </Text>
            )}
          </TouchableOpacity>
          <View style={styles.headerActions}>
            {otherUser?.isOnline && (
              <Text style={styles.onlineStatus}>Online</Text>
            )}
            <TouchableOpacity
              style={styles.addParticipantsButton}
              onPress={() => navigation.navigate('AddParticipants', { 
                chatId: chatId,
                currentMembers: chat?.members || []
              })}
            >
              <Text style={styles.addParticipantsButtonText}>+ Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.leaveChatButton}
              onPress={handleLeaveChat}
            >
              <Text style={styles.leaveChatButtonText}>Leave</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showParticipants && (
          <View style={styles.participantsContainer}>
            <Text style={styles.participantsTitle}>Participants</Text>
            {getChatParticipants().map((participant, index) => (
              <View key={participant.uid} style={styles.participantItem}>
                <Text style={styles.participantName}>
                  {participant.displayName || 'Unknown User'}
                </Text>
              </View>
            ))}
          </View>
        )}

        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.messageId} // Changed from item._id to item.messageId
          style={styles.messagesList}
          inverted={false}
          showsVerticalScrollIndicator={false}
        />

        {isTyping && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>
              {typingUser} is typing...
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={onInputTextChanged}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  participantCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addParticipantsButton: {
    backgroundColor: '#FF6347',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  addParticipantsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  leaveChatButton: {
    backgroundColor: '#FF6347',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  leaveChatButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginVertical: 5,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#FF6347',
    borderBottomRightRadius: 5,
  },
  otherBubble: {
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
    opacity: 0.7,
  },
  typingContainer: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 15,
    marginBottom: 5,
    borderRadius: 15,
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: '#FF6347',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
    fontStyle: 'italic',
  },
  participantsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  participantItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  participantName: {
    fontSize: 14,
    color: '#333',
  },
});
