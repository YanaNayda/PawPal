import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, KeyboardAvoidingView, Platform , Button,TextInput, Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; 

import { useUser } from '../../context/UserContext';
import { Chip } from 'react-native-paper';
import MyChips from './components/MyChips';
import { ScrollView } from 'react-native';
import axios from 'axios';
 import uuid from 'react-native-uuid';
 import { SERVER_CONFIG } from  '../../config/serverConfig';
 

const  CreatePost = ({ navigation }) => {
      
    const [localPhoto, setLocalPhoto] = useState(null);  
    const [loadingImage, setLoadingImage] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [information, setInformation] = useState("");
    const [choseTags, setChoseTags] = useState([]);
    const { userData } = useUser(); 
    const [selected, setSelected] = useState(null);
  
    //const userPostsCount = userData?_userPostsCount;
  const uploadImageToCloudinary = async (imageUri) => {
  const data = new FormData();
  data.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'post.jpg',
  });
  data.append('upload_preset', 'pawpal_upload');  

  try {
    console.log('Sending request to Cloudinary...');
    const res = await fetch('https://api.cloudinary.com/v1_1/ddktpudii/image/upload', {
      method: 'POST',
      body: data,
    });
    
    console.log('Cloudinary response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.log('Cloudinary error response:', errorText);
      return null;
    }
    
    const file = await res.json();
    console.log('Cloudinary upload success:', file.secure_url);
    return file.secure_url; 
  } catch (error) {
    console.log('Cloudinary upload error:', error);
    return null;
  }
   };
 
  const pickImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    Alert.alert('Permission required', 'Gallery permission is required to select a photo.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled && result.assets?.length > 0) {
    const localUri = result.assets[0].uri;
    console.log('Selected image URI:', localUri);
    setLocalPhoto(localUri); // показываем сразу
    setLoadingImage(true);

    console.log('Starting Cloudinary upload for post...');
    const uploadedUrl = await uploadImageToCloudinary(localUri);
    if (uploadedUrl) {
      console.log('Upload successful, setting photo to:', uploadedUrl);
      setPhoto(uploadedUrl);
    } else {
      console.log('Upload failed, showing error alert');
      Alert.alert('Error', 'Failed to upload image to Cloudinary. Please try again.');
      setLocalPhoto(null);
    }
    setLoadingImage(false);
  }
};
 
const deletePhoto = () => {
  setPhoto(null);
};
   
  

return (
 
  <ImageBackground
    source={require('../../assets/background_paw_pal.png')}
    style={styles.background}
    resizeMode="cover"
  >
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}  
      > 
   <ScrollView
  contentContainerStyle={styles.scrollContainer}
  keyboardShouldPersistTaps="handled"
  contentInsetAdjustmentBehavior="always"
>
     {/* Header */}
          <View style={styles.header}>
            <Image
              source={
                userData?.profilePicture
                  ? { uri: userData.profilePicture }
                  : require('../../assets/avatar_paw_pal.png')
              }
              style={styles.avatar}
            />
            <Text style={styles.username}>{userData?.displayName || 'User Name'}</Text>
          </View>

        {/* Image */}
          <View style={styles.container}>
            <View style={styles.imageWrapper}>
              {localPhoto || photo ? (
                <Image source={{ uri: photo || localPhoto }} style={styles.image} />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.placeholderText}>No photo selected</Text>
                </View>
              )}
              {loadingImage && (
                <Text style={{ position: 'absolute', color: 'gray' }}>Uploading...</Text>
              )}
            </View>

         {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={deletePhoto}>
                <Image source={require('../../assets/delete.png')} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Delete Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Image source={require('../../assets/add.png')} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Add Image</Text>
              </TouchableOpacity>
            </View>
          </View>
      
      {/* Input */}
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Tell us about your pet..."
            placeholderTextColor="#888" 
            value={information}
            onChangeText={text => {
              if (text.length <= 200) setInformation(text);
            }}
            multiline={true}
            numberOfLines={6}
          />

        <View style={styles.buttonContainer}> 
       <Button
          style={styles.button}
          title="Submit Post"
          color="#FF6347"
          onPress={
            async() => {
               if (information === '' && (!photo) ) {
                 alert('Please fill in all fields');
                 return;

                }

        try {
            const newPost  = await axios.post(`http://${SERVER_CONFIG.SERVER_IP}:${SERVER_CONFIG.SERVER_PORT}/api/v1/posts/createPost`, {
              postId:uuid.v4(),
              author: userData?.uid,
               content: information,
               imageUrl: photo,
              tags: choseTags,
              likes: [] ,
              comments :[],
              isDeleted: false

          });

        navigation.navigate('Main', {
            screen: 'PawPal',
            params: {
            screen: 'Profile',
          },
        });
           
    
        } catch (error) {
          Alert.alert('Post submit failed', error.response?.data?.message || error.message);
        }
        }}>

      <Text style={styles.textSubmitt}>Submit Post</Text>
       </Button>
       </View>
    </ScrollView>
    </KeyboardAvoidingView>
  </ImageBackground>
 
);
};

export default CreatePost;


const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    margin:10,
     
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    marginBottom: 20,
    
  },
  imageWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  image: {
    width: 220,     // 🔹 уменьшил размер картинки
    height: 220,    // 🔹 уменьшил размер картинки
    borderRadius: 12,
    resizeMode: "cover",
  },
  placeholder: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 12,
  },
  placeholderText: {
    color: "#aaa",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
    buttonContainer: {
    marginTop: 5,
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 5,
  
    width: "100%",
  },
  button: {
    alignItems: "center",
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
    padding: 5,
    borderRadius: 5
  },
  buttonIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  buttonText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  inputMultiline: {
    height: 120,
    textAlignVertical: "top",
  },
});