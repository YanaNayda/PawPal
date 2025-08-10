import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image,TouchableOpacity , Button} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../../context/UserContext.js';
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native';
 import { useFocusEffect } from '@react-navigation/native';
 import axios from 'axios';
 import ProductCard from '../cards/ProductCard.js'
 import FabGroupMarket from '../components/FABGroupMarket.js';
import { useIsFocused } from '@react-navigation/native';
import { SERVER_CONFIG } from '../../../config/serverConfig.js';

import backgroundImage from '../../../assets/back_add.png';

const MarketplaceScreen = () => {
  const isFocused = useIsFocused();
   const navigation = useNavigation();
  const {userData, setUserData } = useUser();
  const [products, setProducts] = useState([]);

   
  

useFocusEffect(
  React.useCallback(() => {
     
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${SERVER_CONFIG.API_BASE_URL}/market`);
        if(!res.ok) {
          const text = await res.text();
          console.error("Server returned error:", text);
          throw new Error("Server error: " + res.status);
        }
        const data = await res.json();
     
        setProducts(data.productPosts);
        console.log('Fetched products:', data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    
   fetchProducts(); // Call fetchPosts here
  }, [])
);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f0f0', borderRadius: 10, shadowColor: '#000'  }  

    }>
        <ImageBackground
      source={backgroundImage}
      style={styles.background}
      resizeMode="cover"
    >
      {isFocused && <FabGroupMarket />}
 

    <FlatList
        data={products}
        keyExtractor={(item) => item._id}
         numColumns={2}
        renderItem={({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('ProductScreen', { product: item })}
          style={{ width: '50%', padding: 3 }}> 
            <ProductCard product={item} />
        </TouchableOpacity>
          )}
           columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingHorizontal: 5, paddingVertical: 5 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 5 }}>No products found</Text>}
        style={{ flex: 1 }}
        />

    </ImageBackground>
     
    </View>
  );
};
   
 
export default MarketplaceScreen;

const styles = StyleSheet.create({
  
buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  backgroundColor: 'transparent',
  marginTop: 6,
  gap: 2,  
},
button: {
  flex: 1,
  backgroundColor: '#FF6347',
  flexDirection: 'row',
  paddingHorizontal: 20,
  gravity: 'center',
  paddingVertical: 15,
  borderRadius: 10,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},
buttonText: {
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 'bold',
},
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
   profileRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    width: '100%',
  },
  spacer: {
     width: '90%',
     height: 50,
    marginBottom: 10,
    marginTop: 5,
    backgroundColor: 'transparent',
    marginHorizontal: 10,
    marginVertical: 5,
  },
});