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
  SafeAreaView,
  Image
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { Searchbar, Chip, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SERVER_CONFIG } from '../../config/serverConfig.js';

export default function SearchScreen({ navigation }) {
  const { userData } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('posts'); // 'posts', 'users', or 'products'
  const [postSearchMode, setPostSearchMode] = useState('content'); // 'content' or 'user'
  const [userSearchMode, setUserSearchMode] = useState('name'); // 'name' or 'uid'
  const [productSearchMode, setProductSearchMode] = useState('name'); // 'name' or 'seller'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // Clear results when switching search types
  useEffect(() => {
    setResults([]);
    setHasSearched(false);
    setError(null);
  }, [searchType, postSearchMode, userSearchMode, productSearchMode]);

  // Clear results when search query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      setError(null);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Empty Search', 'Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      setError(null);

      let endpoint = '';
      let params = {};

      if (searchType === 'posts') {
        endpoint = '/posts/search';
        params = {
          query: searchQuery.trim(),
          searchMode: postSearchMode
        };
      } else if (searchType === 'users') {
        endpoint = '/users/search';
        params = {
          query: searchQuery.trim(),
          searchMode: userSearchMode
        };
      } else if (searchType === 'products') {
        endpoint = '/market/search';
        params = {
          query: searchQuery.trim(),
          searchMode: productSearchMode
        };
      }

      console.log(`Searching ${searchType} with params:`, params);

      const response = await fetch(`${SERVER_CONFIG.API_BASE_URL}${endpoint}?${new URLSearchParams(params)}`);
      const data = await response.json();

      console.log(`Search response for ${searchType}:`, data);

      if (response.ok) {
        // Validate the response structure
        let searchResults = [];
        
        if (searchType === 'posts') {
          searchResults = data.results || data.posts || [];
        } else if (searchType === 'users') {
          searchResults = data.results || data.users || [];
        } else if (searchType === 'products') {
          searchResults = data.products || [];
        }
        
        // Ensure we have an array
        if (Array.isArray(searchResults)) {
          setResults(searchResults);
          console.log(`Found ${searchResults.length} ${searchType}`);
        } else {
          console.error('Invalid response format:', data);
          setError('Invalid response format from server');
          setResults([]);
        }
      } else {
        console.error('Search failed:', data);
        setError(data.message || 'Failed to perform search');
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Network error. Please check your connection and try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderPostItem = ({ item }) => {
    // Validate post data
    if (!item || !item._id) {
      console.warn('Invalid post item:', item);
      return null;
    }

    const authorName = item.author?.displayName || 
                      (typeof item.author === 'string' ? item.author : 'Unknown User');
    const postContent = item.content || 'No content';
    const postDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date';

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => navigation.navigate('PostScreen', { postId: item._id, post: item })}
      >
        <View style={styles.postHeader}>
          <Image
            source={
              item.author?.profilePicture 
                ? { uri: item.author.profilePicture } 
                : require('../../assets/avatar_paw_pal.png')
            }
            style={styles.authorAvatar}
          />
          <View style={styles.postInfo}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.postDate}>{postDate}</Text>
          </View>
        </View>
        <Text style={styles.postContent} numberOfLines={3}>
          {postContent}
        </Text>
        {item.imageUrl && item.imageUrl.trim() !== '' && (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        )}
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }) => {
    // Validate user data
    if (!item || !item.uid) {
      console.warn('Invalid user item:', item);
      return null;
    }

    const userName = item.displayName || 'Unknown User';
    const userEmail = item.email || 'No email';
    const userBio = item.bio || '';

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => navigation.navigate('ViewUser', { userId: item.uid })}
      >
        <View style={styles.userInfo}>
          <Image
            source={
              item.profilePicture && item.profilePicture.trim() !== '' 
                ? { uri: item.profilePicture } 
                : require('../../assets/avatar_paw_pal.png')
            }
            style={styles.userAvatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            {userBio && (
              <Text style={styles.userBio} numberOfLines={2}>
                {userBio}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }) => {
    // Validate product data
    if (!item || !item._id) {
      console.warn('Invalid product item:', item);
      return null;
    }

    const productName = item.title || 'Unknown Product';
    const productCategory = item.category || 'No category';
    const productPrice = item.price ? `${item.price} ₪` : 'Price not set';
    const productLocation = item.location || 'No location';
    const productImage = item.imageUrl || null;

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => navigation.navigate('ProductScreen', { product: item })}
      >
        <View style={styles.productInfo}>
          <Image
            source={
              productImage && productImage.trim() !== '' 
                ? { uri: productImage } 
                : require('../../assets/no_image.png')
            }
            style={styles.productImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{productName}</Text>
            <Text style={styles.productCategory}>{productCategory}</Text>
            <Text style={styles.productPrice}>{productPrice}</Text>
            <Text style={styles.productLocation}>{productLocation}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.emptyStateText}>Searching...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={performSearch}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Enter a search term to find {searchType}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No {searchType} found for "{searchQuery}"</Text>
        <Text style={styles.emptyStateSubtext}>Try different keywords or search modes</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
      </View>

      {/* Search Type Toggle */}
      <View style={styles.toggleContainer}>
       <SegmentedButtons
  value={searchType}
  onValueChange={setSearchType}
  buttons={[
    { 
      value: 'posts', 
      label: 'Posts',
      style: { borderColor: '#FF6347' },
      labelStyle: { color: searchType === 'posts' ? 'white' : '#FF6347' }
    },
    { 
      value: 'users', 
      label: 'Users',
      style: { borderColor: '#FF6347' },
      labelStyle: { color: searchType === 'users' ? 'white' : '#FF6347' }
    },
    { 
      value: 'products', 
      label: 'Products',
      style: { borderColor: '#FF6347' },
      labelStyle: { color: searchType === 'products' ? 'white' : '#FF6347' }
    }
  ]}
  style={styles.segmentedButtons}
  theme={{
    colors: {
      secondaryContainer: '#FF6347',  
      onSecondaryContainer: 'white'   
    }
  }}
/>
      </View>

      {/* Search Mode Toggles */}
      <View style={styles.modeContainer}>
        {searchType === 'posts' ? (
          <View style={styles.chipContainer}>
            <Chip
              selected={postSearchMode === 'content'}
              onPress={() => setPostSearchMode('content')}
              style={[
                  styles.chip,
                  { backgroundColor: postSearchMode === 'content' ? '#1E90FF' : '#fff' }
              ]}
              textStyle={{
              color: postSearchMode === 'content' ? 'white' : '#1E90FF'
              }}
            >
              Search Content
            </Chip>

            <Chip
              selected={postSearchMode === 'user'}
              onPress={() => setPostSearchMode('user')}
              style={[
                 styles.chip,
                { backgroundColor: postSearchMode === 'user' ? '#1E90FF' : '#fff' }
              ]}
              textStyle={{
               color: postSearchMode === 'user' ? 'white' : '#1E90FF'
              }}
            >
              Search by User
            </Chip>
          </View>
        ) : searchType === 'users' ? (
          <View style={styles.chipContainer}>
            <Chip
              selected={userSearchMode === 'users'}
              onPress={() => setUserSearchMode('users')}
              style={[
                  styles.chip,
                  { backgroundColor: userSearchMode === 'users' ? '#1E90FF' : '#fff' }
              ]}
              textStyle={{
              color: userSearchMode === 'users' ? 'white' : '#1E90FF'
              }}
            >
              Search by Name
            </Chip>
            <Chip
              selected={userSearchMode === 'uid'}
              onPress={() => setUserSearchMode('uid')}
              style={[
                 styles.chip,
                { backgroundColor: userSearchMode === 'uid' ? '#1E90FF' : '#fff' }
              ]}
              textStyle={{
               color: userSearchMode === 'uid' ? 'white' : '#1E90FF'
              }}
            >
              Search by UID
            </Chip>
          </View>
        ) : (
          <View style={styles.chipContainer}>

            <Chip
              selected={productSearchMode === 'name'}
              onPress={() => setProductSearchMode('name')}
             style={[
                 styles.chip,
                { backgroundColor: productSearchMode === 'name' ? '#1E90FF' : '#fff' }
              ]}
              textStyle={{
               color: productSearchMode === 'name' ? 'white' : '#1E90FF'
              }}
            >
              Search by Product Name
            </Chip>

            <Chip
              selected={productSearchMode === 'seller'}
              onPress={() => setProductSearchMode('seller')}
              style={[
                 styles.chip,
                { backgroundColor: productSearchMode === 'seller' ? '#1E90FF' : '#fff' }
              ]}
              textStyle={{
               color: productSearchMode === 'seller' ? 'white' : '#1E90FF'
              }}
            >
              Search by Seller
            </Chip>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={`Search ${searchType}...`}
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={performSearch}
          style={[
            styles.searchBar,
            { backgroundColor: '#f0f0f0' }
        
          ]}
          onClearIconPress={() => {
            setSearchQuery('');
            setResults([]);
            setHasSearched(false);
            setError(null);
          }}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={performSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        renderItem={
          searchType === 'posts' ? renderPostItem : 
          searchType === 'users' ? renderUserItem : 
          renderProductItem
        }
        keyExtractor={(item) => item._id || item.uid}
        style={styles.resultsList}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
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
  },
  toggleContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  modeContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    marginRight: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  segmentedButtons: {
  marginBottom: 10,
  borderRadius: 8,  // чуть скруглить углы
  overflow: 'hidden', 
},
  searchBar: {
    flex: 1,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postDate: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userBio: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6347',
    textAlign: 'center',
    marginBottom: 15,
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
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6347',
    marginBottom: 2,
  },
  productLocation: {
    fontSize: 12,
    color: '#888',
  },
}); 