import { View } from "react-native"
import {Text, Image, StyleSheet} from "react-native"
import {ImageBackground, TouchableOpacity , Button,TextInput} from 'react-native';
 import { FontAwesome } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import backgroundImage from '../../../assets/background_paw_pal.png';
import noImage from '../../../assets/no_image.png';
import Icon from 'react-native-vector-icons/MaterialIcons';


export default function ProductCard({product}) {

    return (
        <View style ={styles.productCard}>
            <Image
              source={
               product.imageUrl
                    ? { uri: product.imageUrl }
                         : noImage }
                style={{ width: '100%', height: 150, borderRadius: 8 }}
                resizeMode="cover"
                />
            
            <View style={styles.contentContainer}>
                <Text style ={styles.productTextTitle} numberOfLines={2} ellipsizeMode="tail">{product.title}</Text>
                 
                <View style={styles.Row}> 
                  <View style={styles.rowInline}>
                    <Icon name="location-pin" size={16} color="#FF6347" style={{  }}/>
                    <Text style={styles.productText}>Location: {product.location}</Text>
                  </View>
                </View>
                 
                <View style={styles.Row}> 
                  <View style={styles.rowInline}>
                    <Icon name="category" size={16} color="#1135abff" style={{  }}/>
                     <Text style ={styles.productTextCategories}> Category: {product.category}</Text>
                  </View>
                </View>

                
                <View style={styles.Row}>
                  <Text style={styles.productDate}>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style ={styles.productText}> Price: {product.price} ₪</Text>
               </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
productCard: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 10,
  marginBottom: 15,
  width: '100%',
  height: 320, // Fixed height for consistent card sizes
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.3,
  shadowRadius: 7,
  elevation: 7,
},
rowInline: {
  flexDirection: 'row',
  alignItems: 'center',
},
contentContainer: {
  flex: 1,
  justifyContent: 'space-between',
  paddingTop: 5,
},
productText: {
  fontSize: 14,
  lineHeight: 16,

},
productTextCategories: {
  fontSize: 14,
  height: 16,

},
productTextTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginTop: 5,
  color: '#333',
},
productDate: {
  fontSize: 12,
  color: 'gray',
  textAlign: 'right',
  lineHeight: 16,
},
Row: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: '#eee',
  paddingTop: 8,
 
},
})