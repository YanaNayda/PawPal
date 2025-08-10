import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { useRoute } from '@react-navigation/native';
import chatApiService from '../../services/chatApiService';
import { SERVER_CONFIG } from '../../config/serverConfig.js';

export default function CreateChatScreen({ navigation }) {
  const { userData } = useUser();
  const route = useRoute();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [creatingChat, setCreatingChat] = useState(false);
  const [autoCreateChat, setAutoCreateChat] = useState(false);

  // Check for preSelectedUsers from route params
  const preSelectedUsers = route?.params?.preSelectedUsers;

  useEffect(() => {
    loadAllUsers();
  }, []);

  // Handle preSelectedUsers
  useEffect(() => {
    if (preSelectedUsers && preSelectedUsers.length > 0) {
      // Find the user objects for the preSelectedUsers UIDs
      const selectedUserObjects = users.filter(user => 
        preSelectedUsers.includes(user.uid)
      );
      
      if (selectedUserObjects.length > 0) {
        setSelectedUsers(selectedUserObjects);
        setAutoCreateChat(true);
      }
    }
  }, [preSelectedUsers, users]);

  // Auto-create chat when preSelectedUsers are provided
  useEffect(() => {
    if (autoCreateChat && selectedUsers.length > 0 && !creatingChat) {
      createChat();
    }
  }, [selectedUsers, autoCreateChat]);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_CONFIG.API_BASE_URL}/users/all`);
      const data = await response.json();
      
      // Filter out the current user
      const availableUsers = data.users.filter(user => user.uid !== userData.uid);
      
      setUsers(availableUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.uid === user.uid);
      if (isSelected) {
        return prev.filter(u => u.uid !== user.uid);
      } else {
        return [...prev, user];
      }
    });
  };

  const createChat = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('No Users Selected', 'Please select at least one user to start a chat with.');
      return;
    }

    try {
      setCreatingChat(true);
      
      let response;
      
      if (selectedUsers.length === 1) {
        // Create 1-on-1 chat
        const selectedUser = selectedUsers[0];
        response = await chatApiService.createChat(userData.uid, selectedUser.uid);
        
        console.log('CreateChatScreen: 1-on-1 chat created successfully:', response);

        if (autoCreateChat) {
          // Auto-created chat - navigate directly to chat
          navigation.navigate('Chat', { refresh: true });
        } else {
          // Manual creation - show alert
          Alert.alert(
            'Chat Created!', 
            `Started a chat with ${selectedUser.displayName}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Chat', { refresh: true });
                }
              }
            ]
          );
        }
      } else {
        // Create group chat
        const userIds = [userData.uid, ...selectedUsers.map(user => user.uid)];
        const chatName = `Group Chat (${userIds.length} members)`;
        
        response = await chatApiService.createGroupChat(userIds, chatName, userData.uid);
        
        console.log('CreateChatScreen: Group chat created successfully:', response);

        if (autoCreateChat) {
          // Auto-created chat - navigate directly to chat
          navigation.navigate('Chat', { refresh: true });
        } else {
          // Manual creation - show alert
          Alert.alert(
            'Group Chat Created!', 
            `Started a group chat with ${selectedUsers.length} other members`,
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Chat', { refresh: true });
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat. Please try again.');
    } finally {
      setCreatingChat(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUser = ({ item }) => {
    const isSelected = selectedUsers.some(u => u.uid === item.uid);
    
    return (
      <TouchableOpacity
        style={[
          styles.userItem,
          isSelected && styles.selectedUserItem
        ]}
        onPress={() => toggleUserSelection(item)}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={[
          styles.checkbox,
          isSelected && styles.checkedBox
        ]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  if (autoCreateChat && creatingChat) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Creating chat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!autoCreateChat && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Start New Chat</Text>
            <Text style={styles.subtitle}>
              Select one or more users to start a conversation
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          <FlatList
            data={filteredUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.uid}
            style={styles.usersList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <Text style={styles.selectedCount}>
              {selectedUsers.length === 0 
                ? 'Select users to start chatting' 
                : selectedUsers.length === 1
                ? `Selected: ${selectedUsers[0]?.displayName}`
                : `Selected: ${selectedUsers.length} users`
              }
            </Text>
            <TouchableOpacity
              style={[
                styles.createButton,
                selectedUsers.length === 0 && styles.createButtonDisabled
              ]}
              onPress={createChat}
              disabled={selectedUsers.length === 0 || creatingChat}
            >
              {creatingChat ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.createButtonText}>
                  {selectedUsers.length === 1 ? 'Start Chat' : 'Create Group Chat'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  usersList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedUserItem: {
    backgroundColor: '#f0f8ff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#FF6347',
    borderColor: '#FF6347',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: '#FF6347',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 