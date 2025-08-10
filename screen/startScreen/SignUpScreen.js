import { Alert, StyleSheet,ImageBackground } from "react-native";
import React, { useState } from "react"; 
import { View, Text, Button } from "react-native";
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { TextInput } from 'react-native';
import { Image } from "react-native";
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios';
import { SERVER_CONFIG } from '../../config/serverConfig'; 

 
const SignUpScreen = ({navigation}) => {
  
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

   
    const [Name, setTextName] = useState('');
    const [Email, setTextEmail] = useState('');
    const [Password, setTextPassword] = useState('');
    const [ConfirmPassword, setTextPasswordConfirm] = useState('');
     

    return (
        <ImageBackground
                  source={require('../../assets/back_start_screen.png')}
                  style={styles.background}
                  resizeMode="cover"
                > 
      <KeyboardAvoidingView
       style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>  
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}> 
        <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Name..."
          value={Name}
          onChangeText={setTextName}
        />
         <TextInput
          style={styles.input}
          placeholder="Enter Your Email..."
          value={Email}
          onChangeText={setTextEmail}
        />
        <TextInput
          secureTextEntry={true}
          style={styles.input}
          placeholder="Enter Password..."
          value={Password}
          onChangeText={setTextPassword}
        />

        <TextInput
          secureTextEntry={true}
          style={styles.input}
          placeholder="Confirm Password..."
          value={ConfirmPassword}
          onChangeText={setTextPasswordConfirm}
        />
        
        <Text style={styles.subtitle}>
        Already have an account?{" "} 
        <Text style={{ color: "#FF6347" }} onPress={() => navigation.navigate("LogIn")}>
          Log In
         </Text>
        </Text>

      
        <View style={styles.buttonContainer}>
           <Button
             title="Sign Up"
             color="#FF6347"
              onPress={async () => {
                if (Name === "" || Email === "" || Password === "" || ConfirmPassword === "") {
                  alert("Please fill in all fields!");
                  return;
                }
                if (!isValidEmail(Email)) {
                  alert("Please enter a valid email address!");
                  return;
                }
                if (Password.length < 6) {
                  alert("Password must be at least 6 characters long!");
                  return;
                }
                if (Password.length > 20) {
                  alert("Password must be less than 20 characters long!");
                  return;
                }
                if (Password.includes(" ")) {
                  alert("Password cannot contain spaces!");
                  return;
                }
                if (Password === Name) {
                  alert("Password cannot be the same as your name!");
                  return;
                }
                if (Password === Email) {
                  alert("Password cannot be the same as your email!");
                  return;
                }
                if (Password !== ConfirmPassword) {
                  alert("Passwords do not match!");
                  return;
                }
                console.log('Sign Up button pressed');
                // Proceed with registration
                try {
                    const response = await axios.post( `http://${SERVER_CONFIG.SERVER_IP}:${SERVER_CONFIG.SERVER_PORT}/api/v1/auth/register`,{
                        email: Email,
                         password: Password,
                         displayName: Name
                         });
                    alert("Successful registration!")
                    navigation.navigate("LogIn") 
                    console.log("Registration completed successfully.", response.data);
                } catch (err) {
                    Alert.alert("Registration failed", err.response?.data?.message || err.message);
                }
            }
          }     
          />
        </View>
      </View>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      </ImageBackground>
      );
    };

    export default SignUpScreen;


    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      
        padding: 20,
      },
      title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#ffffff",
        textAlign: "center",
      },
         background: {
        flex: 1,
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