import { View } from "react-native"
import {Text, Image, StyleSheet,   } from "react-native"
import { useState } from 'react';
import { useEffect } from 'react';
import {ImageBackground, TouchableOpacity , Button,TextInput} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { SERVER_CONFIG } from '../../../config/serverConfig.js';
import axios from 'axios';

export default function PostCardHome({ post, onLikePress, onSavePress }) {
  const { userData, setUserData } = useUser();
  const navigation = useNavigation();
  const comments = post.comments || [];
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(userData?.userId));

 

  const handleLikePress = async () => {
  if (!userData?.uid) return;

 
  setIsLiked((prev) => !prev);
  setLikes((prev) => prev + (isLiked ? -1 : 1));

  try {
    const res = await axios.put(
      `${SERVER_CONFIG.API_BASE_URL}/posts/like-post/${post.postId}`,
      { userId: userData.uid }
    );

  
    const updatedLikes = res.data.post.likes;
    setLikes(updatedLikes.length);
    setIsLiked(updatedLikes.includes(userData.uid));
  } catch (error) {
    console.error("Error liking post:", error.response?.data || error.message);
    
    
    setIsLiked((prev) => !prev);
    setLikes((prev) => prev + (isLiked ? 1 : -1));
  }
};
  const handleAuthorPress = () => {
    if (post.author) {
      const authorId = typeof post.author === 'object' 
        ? post.author?.uid 
        : post.author;
      if (authorId) {
        navigation.navigate('ViewUser', { userId: authorId });
      }
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Author Header */}
      <View style={styles.authorHeader}>
       <Image
        source={
          post.author?.profilePicture || post.author?.photoURL
      ? { uri: post.author.profilePicture || post.author.photoURL }
      : require('../../../assets/avatar_paw_pal.png')
      }
      style={styles.authorAvatar}
/>
        <TouchableOpacity onPress={handleAuthorPress} style={styles.authorInfo}>
          <Text style={styles.authorName}>
            {typeof post.author === 'object' 
              ? post.author?.displayName || 'Unknown User'
              : post.author || 'Unknown User'}
          </Text>
        </TouchableOpacity>
      </View>

      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
      )}
      <Text style={styles.postText}>
         {post.content.length > 100
         ? post.content.slice(0, 100) + "..."
         : post.content}
       </Text>
       
      <Text style={styles.postDate}>
        {new Date(post.createdAt).toLocaleDateString()}
      </Text>

      <View style={styles.divider} />

      <View style={styles.actionRow}>
          <TouchableOpacity onPress={handleLikePress} style={styles.actionButton} activeOpacity={0.7}>
            <FontAwesome 
              name={isLiked ? "heart" : "heart-o"} 
              size={16}    
              color={isLiked ? "red" : "black"} 
            />
            <Text style={styles.actionText}>{likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
              onPress={() => navigation.navigate('PostScreen', { postId: post._id, post: post })} 
              style={styles.actionButton}
             activeOpacity={0.7}
            >
            <Feather name="message-circle" size={16} color="black" /> 
            <Text style={styles.actionText}>{comments.length}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
    divider: {
    height: 1,
    backgroundColor: "#d5d6d7ff",   
    marginVertical: 10,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  authorAvatar: {
    width: 30,
    height:30,
    borderRadius: 20,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textDecorationLine: 'underline',
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "400",
    
  },
  postDate: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
  },
   actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",  
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,    
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "#f5f7fa",
  },
 actionText: {
    marginLeft: 4,
    fontSize: 14,  
    color: "#4a4a4a",
    fontWeight: "500",
  },
});