import React, { useEffect, useState } from 'react';
import {View,Text,StyleSheet,ImageBackground,Image,TouchableOpacity,TextInput,ScrollView, Button,} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../context/UserContext';
import { SERVER_CONFIG } from '../../config/serverConfig.js';
import axios from 'axios';
 
 
const EditProfile = ({navigation }) => {
    const { userData } = useUser();

  const [avatar, setAvatar] = useState(null);
  const [localAvatar, setLocalAvatar] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
 
  useEffect(() => {
    if (userData) {
      setUsername(userData.displayName || '');
      setBio(userData.bio || '');
      setAvatar(userData.photoURL || null);
      setEmail(userData.email || '');
      setPhoneNumber(userData.phoneNumber || '');
    }
  }, [userData]);

   const uploadImageToCloudinary = async (imageUri) => {
  const data = new FormData();
  data.append('file', {
    uri: imageUri,
    type: 'image/jpeg',  
    name: 'upload.jpg',
  });
  data.append('upload_preset', 'pawpal_upload');

  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/ddktpudii/image/upload', {
      method: 'POST',
      body: data,
    });

    const file = await res.json();
    return file.secure_url;   
  } catch (error) {
    console.log('Cloudinary upload error:', error);
    return null;
  }
};

     const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert("Permission to access media library is required!");
    return;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log("ImagePicker result:", result);  
    if (!result.canceled && result.assets?.length > 0) {
      const localUri = result.assets[0].uri;
      setLocalAvatar(localUri); // Show immediately
      setLoadingImage(true);

      const uploadedUrl = await uploadImageToCloudinary(localUri);
      if (uploadedUrl) {
        setAvatar(uploadedUrl);
      } else {
        alert('Error uploading image');
        setLocalAvatar(null);
      }
      setLoadingImage(false);
    }
  } catch (error) {
    console.error("Error picking image:", error);
    alert("Could not open gallery");
  }
};

    const saveChanges = async () => {
  try {
    const res = await axios.put(
      `http://${SERVER_CONFIG.SERVER_IP}:${SERVER_CONFIG.SERVER_PORT}/api/v1/users/${userData.uid}`,
      {
        displayName: username,
        bio: bio,
        email: email,
        phoneNumber: phoneNumber,
        profilePicture: avatar,
      }
    );

    alert("Profile updated successfully!");
    navigation.navigate('Main', {
      screen: 'MainTabs',
      params: { screen: 'Home' },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile");
  }
     };


  return (
    <ImageBackground
      source={require('../../assets/back_add2png.png')}
      style={styles.background}
      resizeMode="cover">

      <ScrollView contentContainerStyle={styles.container}>

     <View style={styles.imageWrapper}>
            <Image
               source={localAvatar || avatar ? { uri: localAvatar || avatar } : require('../../assets/avatar_paw_pal.png')}
               style={styles.image}
             />
             <TouchableOpacity style={styles.iconOverlay} onPress={pickImage}>
               <Image
                 source={require('../../assets/icon_camera.png')}  
                 style={styles.icon}
               />
             </TouchableOpacity>
             
             {loadingImage && (
               <View style={styles.loadingOverlay}>
                 <Text style={styles.loadingText}>Uploading...</Text>
               </View>
             )}
     </View> 
        
         <View style={{ width: '100%',color: '#ffffff', }}>
            <Text style={styles.questionText}> Your Name* </Text>
        </View>

        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your name"
        />
          <View style={{ width: '100%',color: '#ffffff', }}>
            <Text style={styles.questionText}>  What do you want to share?</Text>
        </View>

        <TextInput
          style={styles.input}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself"
          multiline
        />

       <View style={{ width: '100%',color: '#ffffffff', }}>
            <Text style={styles.questionText}> What is your email?* </Text>
        </View>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Your email"
          keyboardType="email-address"
        />

        <View style={{ width: '100%',color: '#ffffff', }}>
            <Text style={styles.questionText}>Your Phone Number </Text>
        </View>

        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Your phone number"
          keyboardType="phone-pad"
        />

        <Button 
  style={styles.button}
  title="Save Change"
  onPress={saveChanges}
/>
      
      </ScrollView>
    </ImageBackground>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 100,
  },
  imageWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 5,
    elevation: 3,
  },
  icon: {
    width: 20,
    height: 20,
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginTop: 20,
    width: '90%',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#eee',
  },
  questionText: {
  fontSize: 10,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 5,
  marginStart:25,
  textAlign: 'left',  
},
button: {
  flex: 1,
  backgroundColor: '#FF6347',
  flexDirection: 'row',
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
loadingOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 75,
},
loadingText: {
  color: 'white',
  fontSize: 14,
  fontWeight: 'bold',
},

});