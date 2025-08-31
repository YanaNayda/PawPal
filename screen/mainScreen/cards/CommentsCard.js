import { View } from "react-native"
import {Text, Image, StyleSheet} from "react-native"
import {ImageBackground, TouchableOpacity , Button,TextInput} from 'react-native';
  import  avatarImage from '../../../assets/avatar_paw_pal.png';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
 import { FontAwesome } from '@expo/vector-icons';
import { useUser } from '../../../context/UserContext';

export default function  CommentsCard({ comment, style, onDeletePress}) {
  const navigation = useNavigation();
  const { userData } = useUser();

   const handleAuthorPress = () => {
    if (comment.author) {
      const authorId = typeof comment.author === 'object' 
        ? comment.author?.uid 
        : comment.author;
      if (authorId) {
        navigation.navigate('ViewUser', { userId: authorId });
      }
    }
  };

    const handleDeletePress = (e) => {
    e.stopPropagation();
    if (onDeletePress) {
      console.log('Delete button pressed for comment:', comment._id || comment.commentId);
      onDeletePress(comment._id || comment.commentId);
    }
  };

    return (
    <View style={[styles.commentsCard, style]}>
      <View style={styles.Row}>
        
        <TouchableOpacity onPress={handleAuthorPress}>
          <Text style={styles.authorDisplayName}>
            {typeof comment.author === 'object' 
              ? comment.author?.displayName 
              : comment.authorDisplayName || 'No name'}
          </Text>
        </TouchableOpacity>

        {console.log('comment.authorId:', comment.author, 'userData?.uid:', userData?.uid)}
{comment.author === userData?.uid && (
  <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
    <MaterialIcons name="delete" size={24} color="#FF6347" />
  </TouchableOpacity>
)}
      </View>

      <Text style={styles.commentText}>{comment.content}</Text>
      <Text style={styles.commentDate}>
        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('ru-RU') : 'No date'}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  commentsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 7,
  },
  Row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: '#eee',
   
},
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorDisplayName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  commentText: {
    fontSize: 16,
    marginVertical: 5,
  },
  commentDate: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'left',
  },
 
  deleteButton: {
    padding: 5,

  },
});