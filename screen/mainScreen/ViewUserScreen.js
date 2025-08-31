import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '../../context/UserContext';
import { FlatList } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import PostCardHome from './cards/PostCardHome';
import PostCard from './cards/PostCard';
import ProductCard from './cards/ProductCard';
import { SegmentedButtons } from 'react-native-paper';
import { SERVER_CONFIG } from '../../config/serverConfig.js';

const ViewUserScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route?.params || {};
  const { userData } = useUser();
  
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'products'

  // Check if this is the current user's profile
  const isOwnProfile = userData?.uid === userId;

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserPosts();
      fetchUserProducts();
    }
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchUserData();
        fetchUserPosts();
        fetchUserProducts();
      }
    }, [userId])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${SERVER_CONFIG.API_BASE_URL}/users/${userId}`);
      
      if (response.data.user) {
        setUser(response.data.user);
        
        // Check if current user is following this user
        if (userData?.uid && response.data.user?.followers?.includes(userData.uid)) {
          setIsFollowing(true);
        }
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 404) {
        setError('User not found');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again.');
      } else {
        setError('Failed to load user profile. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`${SERVER_CONFIG.API_BASE_URL}/posts/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setUserPosts(data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      // Don't set error for posts, just log it
    }
  };

  const fetchUserProducts = async () => {
    try {
      const response = await fetch(`${SERVER_CONFIG.API_BASE_URL}/market`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      // Filter products by current user
      const userProducts = data.productPosts.filter(product => product.seller === userId);
      setUserProducts(userProducts);
    } catch (error) {
      console.error('Error fetching user products:', error);
      // Don't set error for products, just log it
    }
  };

  const handleFollow = async () => {
    if (!userData?.uid) {
      Alert.alert('Error', 'You must be logged in to follow users');
      return;
    }

    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      // The backend expects the user ID in the URL params and the current user ID in the body
      const response = await axios.put(`${SERVER_CONFIG.API_BASE_URL}/users/${userId}/${endpoint}`, {
        userId: userData.uid
      });

      if (response.status === 200) {
        setIsFollowing(!isFollowing);
        // Refresh user data to update follower count
        fetchUserData();
        Alert.alert('Success', isFollowing ? 'Unfollowed successfully' : 'Followed successfully');
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      const errorMessage = error.response?.data?.details || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to follow/unfollow user';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleMessage = () => {
    if (!userData?.uid) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }

    // Navigate to chat or create new chat
    navigation.navigate('CreateChat', { selectedUsers: [user] });
  };

  const renderPost = ({ item }) => (
    <View style={styles.postWrapper}>
      <PostCard post={item} />
    </View>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productWrapper}
      onPress={() => navigation.navigate('ProductScreen', { product: item })}
    >
      <ProductCard product={item} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchUserData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/background_paw_pal.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* User Header */}
        <View style={styles.userHeader}>
          <Image
            source={
              user.profilePicture 
                ? { uri: user.profilePicture }
                : require('../../assets/avatar_paw_pal.png')
            }
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.displayName || 'No name'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {user.bio && (
              <Text style={styles.userBio}>{user.bio}</Text>
            )}
          </View>
        </View>

        {/* User Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followings?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isFollowing ? styles.unfollowButton : styles.followButton
              ]}
              onPress={handleFollow}
            >
              <Text style={styles.actionButtonText}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
           buttons={[
                { value: 'posts', label: 'Posts', style: { borderColor: '#1E90FF' },
                labelStyle: { color: activeTab === 'posts' ? 'white' : '#1E90FF' } },

                { value: 'products', label: 'Products',style: { borderColor: '#1E90FF' },
                labelStyle: { color: activeTab === 'products' ? 'white' : '#1E90FF' } },
              ]}
              style={styles.segmentedButtons}
     
              theme={{
              colors: {
                secondaryContainer: '#1E90FF',  
                onSecondaryContainer: 'white'   
              }
            }}
          />
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {activeTab === 'posts' ? (
            <FlatList
              key="posts-list"
              data={userPosts}
              keyExtractor={(item) => item._id}
              numColumns={2}
              renderItem={renderPost}
              contentContainerStyle={styles.postsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.emptyText}>No posts to display yet.</Text>}
            />
          ) : (
            <FlatList
              key="products-list"
              data={userProducts}
              keyExtractor={(item) => item._id}
              numColumns={2}
              renderItem={renderProduct}
              contentContainerStyle={styles.productsList}
              columnWrapperStyle={styles.productRow}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.emptyText}>No products to display yet.</Text>}
            />
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userBio: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6347',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: '#FF6347',
  },
  unfollowButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  messageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  postsList: {
    paddingBottom: 20,
    paddingHorizontal: 0,
  },
  productsList: {
    paddingBottom: 20,
    paddingHorizontal: 5,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  postWrapper: {
    marginBottom: 10,
    marginHorizontal: 0,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productWrapper: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default ViewUserScreen; 