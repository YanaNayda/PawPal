import { View, Image, StyleSheet, Text, TouchableOpacity , Dimensions} from "react-native";
import { useNavigation } from '@react-navigation/native';


const { width: SCREEN_WIDTH } = Dimensions.get('window'); // ширина экрана
const CARD_WIDTH = SCREEN_WIDTH / 2   
const CARD_HEIGHT = CARD_WIDTH;  

export default function PostCard({ post }) {
  const navigation = useNavigation();

  return (
    <View style={[styles.postCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
      <TouchableOpacity onPress={() =>  navigation.navigate('PostScreen', { postId: post._id, post: post }) }>
        {post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    overflow: 'hidden',
  
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
 
});