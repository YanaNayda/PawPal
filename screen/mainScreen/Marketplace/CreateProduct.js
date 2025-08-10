import React, { useState } from 'react';
import {View,Text,StyleSheet,Pressable,ImageBackground,Image,TouchableOpacity,Button,TextInput,ScrollView,Platform,KeyboardAvoidingView,Keyboard,Alert,} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import backgroundImage from '../../../assets/white_back.png';
import { useUser } from '../../../context/UserContext.js';
import axios from 'axios';
import uuid from 'react-native-uuid';
import MarketSegmentedButtons from '../components/MarketSegmentedButtons.js';
import SwitchProduct from '../components/SwitchProduct.js';
import ListCategoriesProducts from '../components/ListCategoriesProduct.js';
 import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
 import { SegmentedButtons } from 'react-native-paper';
 import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { FlatList } from 'react-native-gesture-handler';
import { SERVER_CONFIG } from '../../../config/serverConfig.js';


const CreateProduct = ({ navigation }) => {
 const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
 
  const [status, setStatus] = useState('')
  const [title, setTitle] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [localPhoto, setLocalPhoto] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const { userData } = useUser();

    const uploadImageToCloudinary = async (imageUri) => {
    const data = new FormData();
    data.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'product.jpg',
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

  const DATA = [
    { id: '1', title: 'Other' },
    { id: '2', title: 'Animal' },
    { id: '3', title: 'Pet Supplies' },
    { id: '4', title: 'Food' },
    { id: '5', title: 'Toys' },
    { id: '6', title: 'Accessories' },
    { id: '7', title: 'Clothing' },
    { id: '8', title: 'Health' },
    { id: '9', title: 'Grooming' },
    { id: '10', title: 'Training' },
    { id: '11', title: 'Adoption' },
    { id: '12', title: 'Services' },
    { id: '13', title: 'Veterinary' },
  ];

  const pickImage = async () => {
    console.log('pickImage function called');
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission result:', permissionResult);
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Gallery permission is needed to select a photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      console.log('ImagePicker result:', result);
      if (!result.canceled && result.assets?.length > 0) {
        const localUri = result.assets[0].uri;
        console.log('Selected image URI:', localUri);
        console.log('Image asset details:', result.assets[0]);
        setLocalPhoto(localUri); // Show immediately
        setLoadingImage(true);

        console.log('Starting Cloudinary upload for:', localUri);
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
    } catch (error) {
      console.error('ImagePicker Error:', error);
      Alert.alert('Error', 'Failed to pick an image.');
    }
  };

  const showAlertSave = () =>
    Alert.alert(
     'Do you want to save this product?',   
      'You cannot change it later.',   
      [
         {
          text: 'Yes, I want to save!',
          onPress: () =>  handleSubmit(),
        },
        {
          text: 'No !',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
        onDismiss: () =>
          Alert.alert(
            'This alert was dismissed by tapping outside of the alert dialog.',
          ),
      },
    );

  const deletePhoto = () => {
    setPhoto(null);
    setLocalPhoto(null);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${SERVER_CONFIG.API_BASE_URL}/market/create-product-post`, {
        productId: uuid.v4(),
        seller: userData?.uid,
        description: description,
        location:  location,
        imageUrl: photo,
        category  : category,
        title : title,
        price: Number(price),
        isDeleted: false,
      });

      Alert.alert('Success', 'Product submitted successfully!', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('Main', {
              screen: 'PawPal',
              params: { screen: 'Marketplace' },
            }),
        },
      ]);
    } catch (error) {
      console.error('Submit Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit product');
    }
  };

  const renderItem = ({ item }) => {
    const backgroundColor = item.id === selectedId ? '#6e3b6e' : '#f9c2ff';
    const color = item.id === selectedId ? 'white' : 'black';

    return (
      <TouchableOpacity
        onPress={() => {
          setCategory(item.title);
          setSelectedId(item.id);
        }}
        style={[styles.item, { backgroundColor }]}
      >
        <Text style={[styles.title, { color }]}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

return (
 <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.username}>{userData?.displayName || 'User Name'}</Text>
        </View>
        
        <View style={styles.containerRow}> 
          <View style={styles.leftColumn}> 
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.imageWrapper}>
                {localPhoto || photo ? (
                  <Image source={{ uri: photo || localPhoto }} style={styles.image} />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>No photo selected</Text>
                  </View>
                )}
                
                {loadingImage && (
                  <View style={styles.loadingOverlay}>
                    <Text style={styles.loadingText}>Uploading...</Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>

            <View style={styles.buttonRow}>
               <View style={styles.buttonWrapper}> 
                <Button 
                  color="#d9534f"
                  title="Delete"
                  onPress={() => deletePhoto()}
                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  color="#d9534f"
                  title="Add"
                  onPress={() => pickImage()}
                />
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
             <TextInput
                style={[styles.input, {   }]}
                placeholder="Title of your product"
                placeholderTextColor="#888"
                value={title}
                onChangeText={text => {
                  if (text.length <= 200) setTitle(text);
                }}
                multiline={false}
                numberOfLines={1}
            /> 

            <TextInput
               style={styles.input}
              placeholder="Set your location"
              placeholderTextColor="#888"
              value={location}
              onChangeText={text => {
                if (text.length <= 200) setLocation(text);
              }}
              multiline={true}
              numberOfLines={3}
            />
               <TextInput
                     style={[styles.input, { }]}
                      placeholder="Set your price"
                      placeholderTextColor="#888"
                      value={price.toString()}
                      onChangeText={text => {
                        const number = Number(text);
                        if (!isNaN(number) && text.length <= 200) {
                          setPrice(number);
                        }
                      }}
                      multiline={false}
                      keyboardType="numeric"
                    />

             <View style={styles.textRow}>
                <Text style={styles.text}> Free to a good home.</Text>
                <SwitchProduct />
            </View>    
          </View>
        </View>
    
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{   flexWrap: 'nowrap',  }}> 
            <TextInput
              style={[styles.input, styles.inputMultiline, {  }]}
              placeholder="Tell about your product..."
              placeholderTextColor="#888"
              value={description}
              onChangeText={text => {
                if (text.length <= 200) setDescription(text);
              }}
              multiline={true}
              numberOfLines={7}
            />
          </View>
        </TouchableWithoutFeedback>
             
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap:5 }}>
           {DATA.map((item) => (
           <Pressable
           key={item.id}
            onPress={() => {
                setCategory(item.title);
                setSelectedId(item.id);
              }}
              style={{
               backgroundColor: item.id === selectedId ? "#d9534f" : '#ffffff',
               padding: 12,
               borderRadius: 5,
               margin: 3,
              borderWidth: 1,
              borderColor: '#ccc',
              }}
        >
               <Text style={{ color: item.id === selectedId ? 'white' : 'black' }}>
                {item.title}
               </Text>
            </Pressable>
                    ))}
        </View>
             
        <View style={styles.buttonSubmit}>
          <Button
            color="#d9534f"
            title="Submit Product"
            onPress={() => {
                if (!description || !location || !price || !category || !title) {
                   Alert.alert('Error', 'Please fill in all required fields');
                    return;
                    } else {
                  showAlertSave();
                    }
                 }}
          />
        </View>
      </View>
  </ImageBackground>
  );
};

export default CreateProduct;

const styles = StyleSheet.create({
 container: {
    alignItems: 'right',
    padding: 12,
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
    buttonRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width:'100%',
  },
  buttonWrapper: {
    flex: 1, 
  },
   rightColumn: {
    flex: 5,
    paddingLeft: 10,
    justifyContent: 'top',
  },
   leftColumn: {
     flex: 5,
  },
  textRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  } ,
   deleteButton: {
    backgroundColor: '#ff6b6b',
  },
  addButton: {
    backgroundColor: '#0374b1ff',
  },
  buttonSubmit: {
    height: 50,
    width: '100%',
    backgroundColor: '#FF6347',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textSubmitt: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
    textAlignVertical: 'top',
  },
  inputMultiline: {
    height: 100,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#080327',
    marginRight: 10,
  },
   imageWrapper: {
    width:'100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontStyle: 'italic',
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
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
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});