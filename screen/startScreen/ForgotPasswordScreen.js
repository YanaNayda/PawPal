import { StyleSheet,ImageBackground } from "react-native";
import React, { useState } from "react"; 
import { View, Text, Button ,TextInput } from "react-native";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import { Alert } from 'react-native';
import { SERVER_CONFIG } from '../../config/serverConfig'; 


export default function ForgotPasswordScreen({ navigation })  {



    const [email, setTextEmail] = useState('');
  
    return (
  <ImageBackground
            source={require('../../assets/back_start_screen.png')}
            style={styles.background}
            resizeMode="cover"
          > 

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}> Forgot your Password ?</Text>
    
  
        <TextInput
          style={styles.input}
          placeholder="Enter Your Email..."
          value={email}
          iconName='ios-mail'
          iconColor='#2C384A'
          onChangeText={setTextEmail}
        />
       
  
        <Text style={{ 
          alignSelf: 'flex-end', 
          textDecorationLine: 'underline', 
          color: '#ffffff', 
        }} 
        onPress={() =>  navigation.navigate("LogIn")}>
          I remembered my password
        </Text>
  
    
        <View style={styles.buttonContainer}>
        <Button
         title="Send Password Reset Email"
         color="#FF6347"
         onPress={() => {
            if (email === "") {
              Alert.alert("Validation Error", "Please fill in all fields!");
              return;
            }
          
            if (!isValidEmail(email)) {
              alert("Please enter a valid email address!");
              return;
            }

            axios.post(`http://${SERVER_CONFIG.SERVER_IP}:${SERVER_CONFIG.SERVER_PORT}/api/v1/auth/forgotpassword`, {email})

                      .then(res => {
                        //Alert is async ? 
                      alert('Success', res.data.message);
                          
                       setTimeout(() => {
                            Alert.alert("Password reset email sent!");
                           navigation.navigate("LogIn");
                       }, 100); // Wait for 1 second before navigating}
                      
                    })
                     .catch(err => {
                         alert("Error: " + err);
                         Alert.alert("Something went wrong", err.response?.data?.message || err.message);
              });
    }}
  />
</View>
      </View>
    </TouchableWithoutFeedback>
    </ImageBackground>
      );
    };

    
function isValidEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
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