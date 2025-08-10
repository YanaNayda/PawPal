import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function PostCard({ post }) {
  const navigation = useNavigation();

  return (
    <View style={styles.postCard}>
      {/* Author Header */}
      <View style={styles.authorHeader}>
        <Image
          source={
            post.author?.profilePicture 
              ? { uri: post.author.profilePicture }
              : require('../../../assets/avatar_paw_pal.png')
          }
          style={styles.authorAvatar}
        />
        <TouchableOpacity 
          onPress={() => {
            if (post.author) {
              const authorId = typeof post.author === 'object' 
                ? post.author?.uid 
                : post.author;
              if (authorId) {
                navigation.navigate('ViewUser', { userId: authorId });
              }
            }
          }}
        >
          <Text style={styles.authorName}>
            {typeof post.author === 'object' 
              ? post.author?.displayName 
              : post.author || 'Unknown User'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Post Content */}
      {post.content && (
        <Text style={styles.postContent} numberOfLines={3}>
          {post.content}
        </Text>
      )}
      
      {/* Post Image */}
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authorHeader: {
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
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    resizeMode: 'cover',
  },
});
