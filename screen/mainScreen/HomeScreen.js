import React from 'react';
import MyChips from './components/MyChips';  
import { useState } from 'react';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image,TouchableOpacity , Button, RefreshControl, ActivityIndicator} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../context/UserContext';
import EditProfile from './EditProfile';
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native';
import { SERVER_CONFIG } from '../../config/serverConfig.js';
 import CreatePost from './CreatePost';
 import { useFocusEffect } from '@react-navigation/native';
 import axios from 'axios';
import PostCardHome from './cards/PostCardHome';
import { set } from 'mongoose';


export default function HomeScreen({}) {
  const { userData, setUserData } = useUser();
  const navigation = useNavigation();
  const [username, setUsername] = useState([]);
  const [allPosts, setAlPosts] = useState([]);
  const [choseTags, setChoseTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
 
  useEffect(() => {
    if (userData) {
      setUsername(userData.displayName || "No name");
    }
  }, [userData]);

  useFocusEffect(
    React.useCallback(() => {
      fetchAllPosts();
    }, [])
  );

  const fetchAllPosts = async (isRefresh = false) => {
    try {
      // Skip fetch if we have recent data (within 30 seconds) and not refreshing
      const now = Date.now();
      if (!isRefresh && allPosts.length > 0 && (now - lastFetchTime) < 30000) {
        console.log('Using cached posts data');
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const res = await fetch(`${SERVER_CONFIG.API_BASE_URL}/posts/`);
      if (!res.ok) {
        const text = await res.text();
        console.error("Server returned error:", text);
        throw new Error("Server error: " + res.status);
      }
      const data = await res.json();
      setAlPosts(data.posts || []);
      setLastFetchTime(now);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchAllPosts(true);
  };

  return (
     <ImageBackground
            source={require('../../assets/back_add2png.png')}
            style={styles.background}
            resizeMode="cover"
          > 
    <View style={styles.container}>
      <View style={styles.headerContainer}>
 
        <Text style={styles.subtitle}>Welcome, {username}!</Text>
      </View>

      
      {loading && allPosts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={allPosts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.postWrapper}
              onPress={() => {
                console.log('Navigating to PostScreen with item:', item);
                navigation.navigate("PostScreen", { postId: item._id, post: item });
              }}
            >
               <PostCardHome
                  post={item}
                  userId={userData?.uid}
                  onLikePress={() => {}}
                />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No posts to display yet.</Text>
          }
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF6347']}
              tintColor="#FF6347"
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
          updateCellsBatchingPeriod={50}
        />
      )}
    </View>
    </ImageBackground>
  );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
  },
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
 
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4a4a4a",
  },
  chipsContainer: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    
    borderBottomWidth: 1,
 
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  postWrapper: {
    width: "100%",
    
    borderRadius: 16,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6b7280",
    marginTop: 40,
    fontWeight: "500",
    
  },
   background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});