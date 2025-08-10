import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image,TouchableOpacity , SafeAreaView, Button} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../context/UserContext';
import EditProfile from './EditProfile';
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native';
 import CreatePost from './CreatePost';
 import { useFocusEffect } from '@react-navigation/native';
 import axios from 'axios';
 import PostCardHome from './cards/PostCardHome'
import ProductCard from './cards/ProductCard'
import { SegmentedButtons } from 'react-native-paper';
import { SERVER_CONFIG } from '../../config/serverConfig.js';

const ProfileScreen = ( ) => {

  const navigation = useNavigation();
  const {userData, setUserData } = useUser();
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState(" ");
  const [bio, setBio] = useState(" ");
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [posts, setPosts] = useState(0);
  const [products, setProducts] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'products' 

  useEffect(() => {
    if (userData) {
      setUsername(userData.displayName || "No name");
      setBio(userData.bio || "No information about you :(");
       setAvatar(userData.profilePicture || null); 
      setFollowing(userData.followings?.length || 0);
      setFollowers(userData.followers?.length || 0);
      setPosts(userData.userPostsCount || 0);
      setProducts(userData.userProductsCount || 0);
    }
  }, [userData]);
 
  useFocusEffect(
  React.useCallback(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${SERVER_CONFIG.API_BASE_URL}/users/${userData.uid}`);
        setUserData(res.data.user);
      } catch (e) {
        console.log('Failed to fetch user:', e);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch(`${SERVER_CONFIG.API_BASE_URL}/posts/user/${userData.uid}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Server returned error:", text);
          throw new Error("Server error: " + res.status);
        }
        const data = await res.json();
        setUserPosts(data);
      } catch (error) {
        console.error("Error fetching user posts", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${SERVER_CONFIG.API_BASE_URL}/market`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Server returned error:", text);
          throw new Error("Server error: " + res.status);
        }
        const data = await res.json();
        // Filter products by current user
        const userProducts = data.productPosts.filter(product => product.seller === userData.uid);
        setUserProducts(userProducts);
      } catch (error) {
        console.error("Error fetching user products", error);
      }
    };

    fetchUser();
    fetchPosts();
    fetchProducts();  
  }, [userData.uid])
);

 const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      try {
        await axios.put(`${SERVER_CONFIG.API_BASE_URL}/users/${userData.uid}`, {
          photoURL: result.assets[0].uri,
        });
      } catch (e) {
        console.error('Failed to update avatar:', e);
      }
    }
  };

  
   
   
  const renderPost = ({ item }) => (
    <View style={styles.postWrapper}>
      <PostCardHome post={item} />
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

   return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../../assets/white_back.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <View style={styles.block}>
            <View style={styles.profileRow}>
              <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
                <Image
                  source={avatar ? { uri: avatar } : require('../../assets/avatar_paw_pal.png')}
                  style={styles.image}
                />
              </TouchableOpacity>
              <View style={styles.textContainer}>
                <Text style={styles.username}>{username}</Text>
                <Text style={styles.subTitle}>{bio}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>POSTS</Text>
              <Text style={styles.statValue}>{posts}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>FOLLOWING</Text>
              <Text style={styles.statValue}>{following}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>FOLLOWERS</Text>
              <Text style={styles.statValue}>{followers}</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Image
                source={require('../../assets/edit_profil_icon.png')}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <Image
                source={require('../../assets/post_icon.png')}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Create Post</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContainer}>
            <SegmentedButtons
              value={activeTab}
              onValueChange={setActiveTab}
              buttons={[
                { value: 'posts', label: 'Posts' },
                { value: 'products', label: 'Products' }
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          <View style={styles.contentContainer}>
            {activeTab === 'posts' ? (
              <FlatList
                key="posts-list"
                data={userPosts}
                keyExtractor={(item) => item._id}
                numColumns={1}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor:'#ffffff',
  },
  block: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 5,
    width: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#f5f7fa',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '400',
    
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    width: '95%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    backgroundColor: '#FF6347',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    margin:6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
    tintColor: '#ffffff',
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
  postsContainer: {
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

export default ProfileScreen;