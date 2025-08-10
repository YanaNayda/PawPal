import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity , Button,TextInput, Alert} from 'react-native';
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
  <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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

       <View style={styles.container}>
        <View style={styles.imageWrapper}>
        {localPhoto || photo ? (
             <Image 
                source={{ uri: photo || localPhoto }} 
                style={styles.image} 
                />
         ) : (
            <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>No photo selected</Text>
            </View>
        )}

        {loadingImage && (
           <Text style={{ position: 'absolute', color: 'gray' }}>Uploading...</Text>
            )}
      </View>

       <View style={styles.statsContainer}>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button}
               onPress={deletePhoto} 
          >
             <Image source={require('../../assets/delete.png')} style={styles.buttonIcon  } />
            <Text style={styles.buttonText}>Delete Image</Text>
              
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
           onPress={pickImage}
          >
             <Image source={require('../../assets/add.png')} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Add Image</Text>
          
          </TouchableOpacity>
      </View>
    </View>
      
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

  
       <Button
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
  </ImageBackground>
 
);
};

export default CreatePost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  scrollContainer: {
  padding: 20,
  paddingBottom: 60,  
},
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '90%',
  marginTop: 20,
  gap: 10,  
},
buttonSubmit: {
  height: 50,
  backgroundColor: '#01016aff',
  borderRadius: 10,
  padding: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
  justifyContent: 'center',
  alignItems: 'center',  
},
textSubmitt:{
  color: '#ffffffff',
},
button: {
  flex: 1,
  backgroundColor: '#ffffffff',
  flexDirection: 'row',
  width:1,
  paddingHorizontal: 20,
  gravity: 'center',
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},
 statsContainer: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  paddingVertical: 20,
  paddingHorizontal: 20,
   width: '100%',  
  justifyContent: 'space-around',
  alignItems: 'center',
  borderBottomLeftRadius: 30,
  borderBottomRightRadius: 30,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
},
buttonIcon: {
  width: 18,
  height: 18,
  marginRight: 5,
  backgroundColor: 'transparent',
  resizeMode: 'contain',
   tintColor: '#000000ff',
},
  
  imagePickerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
image: {
  width: '100%',         
  aspectRatio: 1,         
   borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
   position: 'relative' 
  
},
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    marginTop: 15,
     shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    textAlignVertical: 'top',  
  },
  inputMultiline: {
    height: 120,          
  },
  background: {
    flex: 1,
  },
  header: {
  flexDirection: 'row',
  justifyContent: 'left',
  alignItems: 'center',
  paddingHorizontal: 5,
},
username: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
  textAlign: 'left',
  justifyContent: 'left',
  marginLeft: 5,
  
},
avatar: {
  width: 50,
  height: 50,
  borderRadius: 50,  
  backgroundColor: '#080327ff', 
  
  marginLeft: 20,
  marginRight: 10,
   

},
imageWrapper: {
  width: '100%',
  aspectRatio: 1,          
 borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
   
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#ccc',
  backgroundColor: '#f0f0f0',   
  justifyContent: 'center',
  alignItems: 'center',
},
buttons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  marginTop: 10,
  marginBottom: 20,
  shadowColor: '#5b5b5bff',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
  backgroundColor: '#ffffffff'
},
});
 