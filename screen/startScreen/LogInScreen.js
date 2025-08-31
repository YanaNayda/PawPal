import { StyleSheet ,ImageBackground} from "react-native";
import React, { useState } from "react"; 
import { View, Text, Button } from "react-native";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { Keyboard, TouchableWithoutFeedback , TextInput ,Alert} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { SERVER_CONFIG } from '../../config/serverConfig'; 

export default function LogInScreen({ navigation }) {
  const [Email, setTextEmail] = useState('');
  const [Password, setTextPassword] = useState('');
  const { setUserData } = useUser();

  return (
     <ImageBackground
            source={require('../../assets/back_start_screen.png')}
            style={styles.background}
            resizeMode="cover"
          > 
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>               
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Your Email..."
          value={Email}
          onChangeText={setTextEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          secureTextEntry={true}
          style={styles.input}
          placeholder="Enter Password..."
          value={Password}
          onChangeText={setTextPassword}
        />

        <Text
          style={{
            alignSelf: 'flex-end',
            textDecorationLine: 'underline',
            color: '#ffffff',
          }}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          Forgot Password?
        </Text>

        <Text style={styles.subtitle}>
          Don't have an account?{' '}
          <Text style={{ color: '#FF6347' }} onPress={() => navigation.navigate('SignUp')}>
            Sign Up
          </Text>
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Log In"
            color="#FF6347"
             onPress={async () => {
      if (Email === '' || Password === '') {
        Alert.alert('Missing Fields', 'Please fill in all fields!');
        return;
      }
      try {
         
       const response = await axios.post(
  `http://${SERVER_CONFIG.SERVER_IP}:${SERVER_CONFIG.SERVER_PORT}/api/v1/auth/login`,
  {
          email: Email,
          password: Password,
        });
        const { user, token } = response.data;
        setUserData(user);

        //if (user.emailVerified === true) {
          Alert.alert('Success', 'Login Successful!');
          navigation.navigate('Main', {
            screen: 'MainTabs',
            params: {
              screen: 'Home',
            },
          });
        //} else {
         // Alert.alert('Verify Email', 'Please verify your email before logging in. Check your inbox.');
       /// }
      } catch (error) {
        Alert.alert('Login failed', error.response?.data?.message || error.message);
      }
    }}
  />
</View>
      </View>
    </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

    


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
     
    padding: 20,
    
  },
     background: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#ffffff",
    marginBottom: 10,
    marginTop: 20,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 10,
    backgroundColor: "#FF6347",
    padding: 15,
    borderRadius: 5,
    width: "60%",
  },
  button: {
    textAlign: "center",
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "bold",
    padding: 10,
    borderRadius: 5
  },

    image: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    input: {
      width: '100%',               
      borderColor: '#FF6347',
      borderWidth: 2,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
      backgroundColor: '#fff',
      marginVertical: 10, 
      paddingVertical: 10,
      paddingTop: 15,
      paddingBottom: 15,
      color: '#000',
    },

});