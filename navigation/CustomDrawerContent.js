import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import { getAuth, signOut } from 'firebase/auth';
 

export default function CustomDrawerContent(props) {
    const { navigation } = props;
    const { setUserData } = useUser();

 const handleLogout = async () => {
  console.log('Log out pressed'); 
  const auth = getAuth();
  try {
    await signOut(auth);
    setUserData(null);

    navigation.reset({
      index: 0,
      routes: [{ name: "LogIn" }],
    });
  } catch (error) {
    console.error('Error signing out: ', error);
  }
};

    return (
       <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutContainer: {
    padding: 16,
    marginBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
});